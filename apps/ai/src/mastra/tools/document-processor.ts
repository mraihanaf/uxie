/**
 * Document Processor - Mastra Aligned
 *
 * Uses @mastra/rag MDocument for document processing and chunking
 * following Mastra's recommended RAG patterns.
 */

import { createTool } from "@mastra/core/tools";
import { MDocument } from "@mastra/rag";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { z } from "zod";
import * as pdfParse from "pdf-parse";
import { getPgVector, EMBEDDINGS_INDEX } from "./supabase-vector";

/**
 * Embedding model for document processing
 */
const EMBEDDING_MODEL = openai.embedding("text-embedding-3-small");

/**
 * Supported document types
 */
export type DocumentType = "pdf" | "text" | "markdown";

/**
 * Parse PDF from base64 content
 */
async function parsePdfFromBase64(base64Content: string): Promise<string> {
    const buffer = Buffer.from(base64Content, "base64");
    // Handle both default and named export patterns
    const pdf = (pdfParse as any).default || pdfParse;
    const data = await pdf(buffer);
    return data.text;
}

/**
 * Process a single document and add to vector store
 */
export const processDocumentTool = createTool({
    id: "process-document",
    description:
        "Process a document (PDF, text, or markdown), chunk it, generate embeddings, and add to vector store for RAG.",
    inputSchema: z.object({
        courseId: z.string().describe("The course ID this document belongs to"),
        documentId: z.string().describe("Unique identifier for this document"),
        content: z
            .string()
            .describe(
                "The document content (base64 for PDF, plain text for others)",
            ),
        type: z.enum(["pdf", "text", "markdown"]).describe("Type of document"),
        filename: z.string().optional().describe("Original filename"),
        metadata: z
            .record(z.unknown())
            .optional()
            .describe("Additional metadata"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        chunksProcessed: z.number(),
        message: z.string(),
    }),
    execute: async ({ context }) => {
        try {
            // Step 1: Extract text based on document type
            let text: string;

            if (context.type === "pdf") {
                text = await parsePdfFromBase64(context.content);
            } else {
                text = context.content;
            }

            if (!text || text.trim().length === 0) {
                return {
                    success: false,
                    chunksProcessed: 0,
                    message: "Document is empty or could not be parsed",
                };
            }

            // Step 2: Create MDocument and chunk using Mastra RAG
            let doc: MDocument;

            if (context.type === "markdown") {
                doc = MDocument.fromMarkdown(text);
            } else {
                doc = MDocument.fromText(text);
            }

            // Chunk with recursive strategy (Mastra recommended)
            const chunks = await doc.chunk({
                strategy: "recursive",
                size: 1000,
                overlap: 100,
            });

            if (chunks.length === 0) {
                return {
                    success: false,
                    chunksProcessed: 0,
                    message: "No chunks generated from document",
                };
            }

            console.log(
                `[DocumentProcessor] Generated ${chunks.length} chunks for ${context.documentId}`,
            );

            // Step 3: Generate embeddings for all chunks using AI SDK
            const { embeddings } = await embedMany({
                model: EMBEDDING_MODEL,
                values: chunks.map((chunk) => chunk.text),
            });

            // Step 4: Store in vector store using Mastra PgVector
            const pgVector = getPgVector();

            const ids = chunks.map(
                (_, i) => `${context.documentId}-chunk-${i}`,
            );
            const metadata = chunks.map((chunk, i) => ({
                courseId: context.courseId,
                documentId: context.documentId,
                text: chunk.text,
                chunkIndex: i,
                totalChunks: chunks.length,
                type: context.type,
                filename: context.filename,
                ...context.metadata,
            }));

            await pgVector.upsert({
                indexName: EMBEDDINGS_INDEX,
                vectors: embeddings,
                ids,
                metadata,
            });

            return {
                success: true,
                chunksProcessed: chunks.length,
                message: `Successfully processed ${context.filename || context.documentId}: ${chunks.length} chunks`,
            };
        } catch (error) {
            console.error(
                "[DocumentProcessor] Error processing document:",
                error,
            );
            return {
                success: false,
                chunksProcessed: 0,
                message: `Error processing document: ${error}`,
            };
        }
    },
});

/**
 * Process multiple documents in batch
 */
export const processDocumentsTool = createTool({
    id: "process-documents-batch",
    description:
        "Process multiple documents and add them to the vector store for RAG. Retrieves documents from Supabase storage.",
    inputSchema: z.object({
        courseId: z
            .string()
            .describe("The course ID these documents belong to"),
        documentIds: z
            .array(z.string())
            .describe("Array of document IDs to process from Supabase storage"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        processed: z.number(),
        failed: z.number(),
        totalChunks: z.number(),
        message: z.string(),
    }),
    execute: async ({ context }) => {
        const { createClient } = await import("@supabase/supabase-js");

        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        let processed = 0;
        let failed = 0;
        let totalChunks = 0;

        for (const documentId of context.documentIds) {
            try {
                // Fetch document metadata from database
                const { data: docRecord, error: dbError } = await supabase
                    .from("documents")
                    .select("*")
                    .eq("id", documentId)
                    .single();

                if (dbError || !docRecord) {
                    console.error(
                        `[DocumentProcessor] Document not found: ${documentId}`,
                    );
                    failed++;
                    continue;
                }

                // Download document from storage
                const { data: fileData, error: storageError } =
                    await supabase.storage
                        .from("documents")
                        .download(docRecord.storage_path);

                if (storageError || !fileData) {
                    console.error(
                        `[DocumentProcessor] Failed to download: ${documentId}`,
                    );
                    failed++;
                    continue;
                }

                // Convert to base64 for PDF, text for others
                const buffer = Buffer.from(await fileData.arrayBuffer());
                const isPdf =
                    docRecord.mime_type === "application/pdf" ||
                    docRecord.filename?.toLowerCase().endsWith(".pdf");

                const content = isPdf
                    ? buffer.toString("base64")
                    : buffer.toString("utf-8");
                const type: DocumentType = isPdf
                    ? "pdf"
                    : docRecord.filename?.toLowerCase().endsWith(".md")
                      ? "markdown"
                      : "text";

                // Process the document
                const result = await processDocumentTool.execute!({
                    context: {
                        courseId: context.courseId,
                        documentId,
                        content,
                        type,
                        filename: docRecord.filename,
                        metadata: {
                            originalSize: docRecord.size,
                            mimeType: docRecord.mime_type,
                        },
                    },
                    runId: "",
                    runtimeContext: {} as any,
                });

                if (result.success) {
                    processed++;
                    totalChunks += result.chunksProcessed;
                } else {
                    failed++;
                }
            } catch (error) {
                console.error(
                    `[DocumentProcessor] Error processing ${documentId}:`,
                    error,
                );
                failed++;
            }
        }

        return {
            success: failed === 0,
            processed,
            failed,
            totalChunks,
            message: `Processed ${processed}/${context.documentIds.length} documents (${totalChunks} total chunks)`,
        };
    },
});

/**
 * Process raw text content directly (without file upload)
 */
export const processRawTextTool = createTool({
    id: "process-raw-text",
    description:
        "Process raw text content, chunk it, and add to vector store. Use for user-provided notes or content.",
    inputSchema: z.object({
        courseId: z.string().describe("The course ID this content belongs to"),
        contentId: z.string().describe("Unique identifier for this content"),
        text: z.string().describe("The text content to process"),
        title: z.string().optional().describe("Optional title for the content"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        chunksProcessed: z.number(),
        message: z.string(),
    }),
    execute: async ({ context }) => {
        try {
            // Create MDocument from text
            const doc = MDocument.fromText(context.text);

            // Chunk using recursive strategy
            const chunks = await doc.chunk({
                strategy: "recursive",
                size: 1000,
                overlap: 100,
            });

            if (chunks.length === 0) {
                return {
                    success: false,
                    chunksProcessed: 0,
                    message: "No chunks generated from text",
                };
            }

            // Generate embeddings
            const { embeddings } = await embedMany({
                model: EMBEDDING_MODEL,
                values: chunks.map((chunk) => chunk.text),
            });

            // Store in vector store
            const pgVector = getPgVector();

            await pgVector.upsert({
                indexName: EMBEDDINGS_INDEX,
                vectors: embeddings,
                ids: chunks.map((_, i) => `${context.contentId}-chunk-${i}`),
                metadata: chunks.map((chunk, i) => ({
                    courseId: context.courseId,
                    contentId: context.contentId,
                    text: chunk.text,
                    chunkIndex: i,
                    totalChunks: chunks.length,
                    type: "user_text",
                    title: context.title,
                })),
            });

            return {
                success: true,
                chunksProcessed: chunks.length,
                message: `Successfully processed text: ${chunks.length} chunks`,
            };
        } catch (error) {
            console.error(
                "[DocumentProcessor] Error processing raw text:",
                error,
            );
            return {
                success: false,
                chunksProcessed: 0,
                message: `Error processing text: ${error}`,
            };
        }
    },
});

/**
 * Helper function to process documents for course creation
 */
export async function processDocumentsForCourse(
    courseId: string,
    documentIds: string[],
): Promise<{ success: boolean; totalChunks: number }> {
    if (!documentIds || documentIds.length === 0) {
        return { success: true, totalChunks: 0 };
    }

    const result = await processDocumentsTool.execute!({
        context: {
            courseId,
            documentIds,
        },
        runId: "",
        runtimeContext: {} as any,
    });

    return {
        success: result.success,
        totalChunks: result.totalChunks,
    };
}
