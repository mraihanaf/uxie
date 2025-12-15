/**
 * Supabase Vector Store - Mastra Aligned
 *
 * Uses @mastra/pg PgVector for vector storage and retrieval
 * following Mastra's recommended RAG patterns.
 */

import { createTool } from "@mastra/core/tools";
import { PgVector } from "@mastra/pg";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { z } from "zod";

// Initialize PgVector with Supabase connection
const connectionString =
    process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

// Lazy initialization of PgVector
let pgVectorInstance: PgVector | null = null;

/**
 * Get or create PgVector instance
 */
export function getPgVector(): PgVector {
    if (!pgVectorInstance) {
        if (!connectionString) {
            throw new Error(
                "SUPABASE_DB_URL or DATABASE_URL environment variable is required",
            );
        }
        pgVectorInstance = new PgVector({ connectionString });
    }
    return pgVectorInstance;
}

/**
 * Index name for document embeddings
 */
export const EMBEDDINGS_INDEX = "document_embeddings";

/**
 * Embedding model for vector operations
 */
const EMBEDDING_MODEL = openai.embedding("text-embedding-3-small");

/**
 * Initialize the vector store index if it doesn't exist
 */
export async function initializeVectorStore(): Promise<void> {
    const pgVector = getPgVector();

    try {
        await pgVector.createIndex({
            indexName: EMBEDDINGS_INDEX,
            dimension: 1536,
        });
        console.log("[VectorStore] Index created or already exists");
    } catch (error) {
        // Index might already exist, which is fine
        console.log("[VectorStore] Index initialization:", error);
    }
}

/**
 * Tool to add documents to the vector store
 */
export const addToVectorStore = createTool({
    id: "add-to-vector-store",
    description:
        "Add document content to the vector store for a specific course. Use this to store uploaded document content for retrieval during course creation.",
    inputSchema: z.object({
        courseId: z
            .string()
            .describe("The course ID to associate the content with"),
        contentId: z
            .string()
            .describe("Unique identifier for this piece of content"),
        text: z.string().describe("The text content to store"),
        metadata: z
            .object({
                type: z
                    .string()
                    .describe("Type of content: pdf_chunk, user_note, etc"),
                filename: z
                    .string()
                    .optional()
                    .describe("Original filename if from a file"),
                pageNumber: z
                    .number()
                    .optional()
                    .describe("Page number if from a PDF"),
                chapterIndex: z
                    .number()
                    .optional()
                    .describe("Chapter index if relevant"),
            })
            .describe("Metadata about the content"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
    }),
    execute: async ({ context }) => {
        try {
            const pgVector = getPgVector();

            // Generate embedding using AI SDK
            const { embedding } = await embed({
                model: EMBEDDING_MODEL,
                value: context.text,
            });

            // Upsert to vector store with Mastra pattern
            await pgVector.upsert({
                indexName: EMBEDDINGS_INDEX,
                vectors: [embedding],
                ids: [context.contentId],
                metadata: [
                    {
                        courseId: context.courseId,
                        text: context.text,
                        ...context.metadata,
                    },
                ],
            });

            return {
                success: true,
                message: `Successfully added content ${context.contentId} to vector store`,
            };
        } catch (error) {
            console.error("[VectorStore] Error adding to store:", error);
            return {
                success: false,
                message: `Error adding to vector store: ${error}`,
            };
        }
    },
});

/**
 * Tool to search the vector store for relevant content
 */
export const searchVectorStore = createTool({
    id: "search-vector-store",
    description:
        "Search the vector store for relevant content based on a query. Use this to retrieve context from uploaded documents during course creation or chat.",
    inputSchema: z.object({
        courseId: z.string().describe("The course ID to search within"),
        query: z.string().describe("The search query to find relevant content"),
        limit: z
            .number()
            .int()
            .min(1)
            .max(20)
            .default(5)
            .describe("Maximum number of results to return"),
        threshold: z
            .number()
            .min(0)
            .max(1)
            .default(0.7)
            .describe("Similarity threshold (0-1, higher is more similar)"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        results: z.array(
            z.object({
                contentId: z.string(),
                text: z.string(),
                similarity: z.number(),
                metadata: z.record(z.unknown()),
            }),
        ),
        message: z.string().optional(),
    }),
    execute: async ({ context }) => {
        try {
            const pgVector = getPgVector();

            // Generate query embedding using AI SDK
            const { embedding } = await embed({
                model: EMBEDDING_MODEL,
                value: context.query,
            });

            // Query vector store with Mastra pattern
            const results = await pgVector.query({
                indexName: EMBEDDINGS_INDEX,
                queryVector: embedding,
                topK: context.limit,
                filter: {
                    courseId: context.courseId,
                },
            });

            // Filter by threshold and format results
            const filteredResults = results
                .filter((r) => (r.score || 0) >= context.threshold)
                .map((r) => ({
                    contentId: r.id || "",
                    text: (r.metadata?.text as string) || "",
                    similarity: r.score || 0,
                    metadata: r.metadata || {},
                }));

            return {
                success: true,
                results: filteredResults,
            };
        } catch (error) {
            console.error("[VectorStore] Error searching store:", error);
            return {
                success: false,
                results: [],
                message: `Error searching vector store: ${error}`,
            };
        }
    },
});

/**
 * Tool to get RAG context for a chapter topic
 */
export const getChapterRAGContextTool = createTool({
    id: "get-chapter-rag-context",
    description:
        "Get relevant context from uploaded documents for a specific chapter topic. Searches by caption and content points.",
    inputSchema: z.object({
        courseId: z.string().describe("The course ID"),
        chapterCaption: z.string().describe("The chapter caption/title"),
        contentPoints: z
            .array(z.string())
            .describe("The learning points for this chapter"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        context: z
            .array(z.string())
            .describe("Relevant content from documents"),
        message: z.string().optional(),
    }),
    execute: async ({ context }) => {
        try {
            const pgVector = getPgVector();
            const allResults = new Set<string>();

            // Search by chapter caption
            const { embedding: captionEmbedding } = await embed({
                model: EMBEDDING_MODEL,
                value: context.chapterCaption,
            });

            const captionResults = await pgVector.query({
                indexName: EMBEDDINGS_INDEX,
                queryVector: captionEmbedding,
                topK: 3,
                filter: {
                    courseId: context.courseId,
                },
            });

            captionResults
                .filter((r) => (r.score || 0) >= 0.6)
                .forEach((r) => {
                    if (r.metadata?.text) {
                        allResults.add(r.metadata.text as string);
                    }
                });

            // Search by each content point
            for (const point of context.contentPoints.slice(0, 3)) {
                const { embedding: pointEmbedding } = await embed({
                    model: EMBEDDING_MODEL,
                    value: point,
                });

                const pointResults = await pgVector.query({
                    indexName: EMBEDDINGS_INDEX,
                    queryVector: pointEmbedding,
                    topK: 2,
                    filter: {
                        courseId: context.courseId,
                    },
                });

                pointResults
                    .filter((r) => (r.score || 0) >= 0.6)
                    .forEach((r) => {
                        if (r.metadata?.text) {
                            allResults.add(r.metadata.text as string);
                        }
                    });
            }

            return {
                success: true,
                context: Array.from(allResults),
            };
        } catch (error) {
            console.error("[VectorStore] Error getting RAG context:", error);
            return {
                success: false,
                context: [],
                message: `Error getting RAG context: ${error}`,
            };
        }
    },
});

/**
 * Get RAG context for a chapter (standalone function)
 */
export async function getRAGContextForChapter(params: {
    courseId: string;
    chapterCaption: string;
    contentPoints: string[];
}): Promise<string[]> {
    const result = await getChapterRAGContextTool.execute!({
        context: params,
        runId: "",
        runtimeContext: {} as any,
    });

    return result.context;
}

/**
 * Check if a course has any documents in the vector store
 */
export async function courseHasDocuments(courseId: string): Promise<boolean> {
    try {
        const pgVector = getPgVector();

        // Generate a dummy embedding to search
        const { embedding } = await embed({
            model: EMBEDDING_MODEL,
            value: "test query",
        });

        const results = await pgVector.query({
            indexName: EMBEDDINGS_INDEX,
            queryVector: embedding,
            topK: 1,
            filter: {
                courseId,
            },
        });

        return results.length > 0;
    } catch (error) {
        console.error("[VectorStore] Error checking for documents:", error);
        return false;
    }
}

/**
 * Add multiple chunks to vector store in batch
 */
export async function addChunksToVectorStore(params: {
    courseId: string;
    chunks: Array<{
        id: string;
        text: string;
        metadata: Record<string, unknown>;
    }>;
}): Promise<{ success: boolean; count: number }> {
    try {
        const pgVector = getPgVector();
        const { embeddings } = await import("ai").then(async (ai) => {
            return ai.embedMany({
                model: EMBEDDING_MODEL,
                values: params.chunks.map((c) => c.text),
            });
        });

        await pgVector.upsert({
            indexName: EMBEDDINGS_INDEX,
            vectors: embeddings,
            ids: params.chunks.map((c) => c.id),
            metadata: params.chunks.map((c) => ({
                courseId: params.courseId,
                text: c.text,
                ...c.metadata,
            })),
        });

        return {
            success: true,
            count: params.chunks.length,
        };
    } catch (error) {
        console.error("[VectorStore] Error adding chunks:", error);
        return {
            success: false,
            count: 0,
        };
    }
}
