/**
 * Embeddings Tool - Mastra Aligned
 *
 * Uses AI SDK's embedMany for batch embedding generation
 * following Mastra's recommended RAG patterns.
 */

import { createTool } from "@mastra/core/tools";
import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { z } from "zod";

/**
 * Embedding dimension - using 1536 for text-embedding-3-small
 */
export const EMBEDDING_DIMENSION = 1536;

/**
 * Default embedding model
 */
const EMBEDDING_MODEL = openai.embedding("text-embedding-3-small");

/**
 * Generate embedding for a single text using AI SDK
 */
export async function generateEmbedding(
    text: string,
): Promise<number[] | null> {
    try {
        const { embedding } = await embed({
            model: EMBEDDING_MODEL,
            value: text,
        });

        return embedding;
    } catch (error) {
        console.error("[Embeddings] Error generating embedding:", error);
        return null;
    }
}

/**
 * Generate embeddings for multiple texts in batch using AI SDK
 */
export async function generateEmbeddings(
    texts: string[],
): Promise<(number[] | null)[]> {
    if (texts.length === 0) {
        return [];
    }

    try {
        const { embeddings } = await embedMany({
            model: EMBEDDING_MODEL,
            values: texts,
        });

        return embeddings;
    } catch (error) {
        console.error("[Embeddings] Error generating embeddings:", error);
        return texts.map(() => null);
    }
}

/**
 * Tool to generate embedding for text
 */
export const generateEmbeddingTool = createTool({
    id: "generate-embedding",
    description:
        "Generate a vector embedding for text using OpenAI's text-embedding-3-small model. Used for semantic search and RAG.",
    inputSchema: z.object({
        text: z.string().describe("The text to generate an embedding for"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        embedding: z.array(z.number()).optional(),
        dimension: z.number().optional(),
        message: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const embedding = await generateEmbedding(context.text);

        if (!embedding) {
            return {
                success: false,
                message: "Failed to generate embedding. Check OPENAI_API_KEY.",
            };
        }

        return {
            success: true,
            embedding,
            dimension: embedding.length,
        };
    },
});

/**
 * Tool to generate embeddings for multiple texts
 */
export const generateEmbeddingsTool = createTool({
    id: "generate-embeddings-batch",
    description:
        "Generate vector embeddings for multiple texts in a single batch using AI SDK. More efficient than individual calls.",
    inputSchema: z.object({
        texts: z
            .array(z.string())
            .describe("Array of texts to generate embeddings for"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        embeddings: z.array(z.array(z.number()).nullable()).optional(),
        count: z.number().optional(),
        message: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const embeddings = await generateEmbeddings(context.texts);

        const successCount = embeddings.filter((e) => e !== null).length;

        if (successCount === 0) {
            return {
                success: false,
                message:
                    "Failed to generate any embeddings. Check OPENAI_API_KEY.",
            };
        }

        return {
            success: true,
            embeddings,
            count: successCount,
        };
    },
});

/**
 * Chunk text into smaller pieces for embedding
 * Uses simple paragraph-based chunking with overlap
 */
export function chunkText(
    text: string,
    options: {
        maxChunkSize?: number;
        overlap?: number;
        minChunkSize?: number;
    } = {},
): string[] {
    const { maxChunkSize = 1000, overlap = 100, minChunkSize = 100 } = options;

    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

    const chunks: string[] = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
        // If adding this paragraph exceeds max size, save current and start new
        if (
            currentChunk.length + paragraph.length > maxChunkSize &&
            currentChunk.length > 0
        ) {
            chunks.push(currentChunk.trim());

            // Keep overlap from end of current chunk
            const words = currentChunk.split(/\s+/);
            const overlapWords = words.slice(-Math.ceil(overlap / 5)); // Approximate word count for overlap
            currentChunk = overlapWords.join(" ") + " " + paragraph;
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        }
    }

    // Add remaining chunk
    if (currentChunk.trim().length >= minChunkSize) {
        chunks.push(currentChunk.trim());
    } else if (chunks.length > 0 && currentChunk.trim().length > 0) {
        // Append small remaining chunk to last chunk
        chunks[chunks.length - 1] += "\n\n" + currentChunk.trim();
    } else if (currentChunk.trim().length > 0) {
        // Only chunk and it's small, still include it
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Tool to chunk text for embedding
 */
export const chunkTextTool = createTool({
    id: "chunk-text",
    description:
        "Split text into smaller chunks suitable for embedding. Uses paragraph-based chunking with configurable overlap.",
    inputSchema: z.object({
        text: z.string().describe("The text to chunk"),
        maxChunkSize: z
            .number()
            .int()
            .min(100)
            .max(8000)
            .default(1000)
            .describe("Maximum characters per chunk"),
        overlap: z
            .number()
            .int()
            .min(0)
            .max(500)
            .default(100)
            .describe("Character overlap between chunks"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        chunks: z.array(z.string()),
        count: z.number(),
    }),
    execute: async ({ context }) => {
        const chunks = chunkText(context.text, {
            maxChunkSize: context.maxChunkSize,
            overlap: context.overlap,
        });

        return {
            success: true,
            chunks,
            count: chunks.length,
        };
    },
});
