import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Unsplash photo search tool
 * Used by agents to find relevant images for courses and chapters
 */
export const searchUnsplashPhotos = createTool({
    id: "search-unsplash-photos",
    description:
        "Search for photos on Unsplash. Use this to find relevant cover images for courses or chapters.",
    inputSchema: z.object({
        query: z.string().describe("Search keyword for finding photos"),
        page: z
            .number()
            .int()
            .min(1)
            .default(1)
            .describe("Page number (1-based)"),
        perPage: z
            .number()
            .int()
            .min(1)
            .max(30)
            .default(5)
            .describe("Results per page (1-30)"),
        orientation: z
            .enum(["landscape", "portrait", "squarish"])
            .optional()
            .describe("Photo orientation filter"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        photos: z.array(
            z.object({
                id: z.string(),
                description: z.string(),
                urls: z.object({
                    raw: z.string(),
                    full: z.string(),
                    regular: z.string(),
                    small: z.string(),
                    thumb: z.string(),
                }),
                width: z.number(),
                height: z.number(),
                user: z.object({
                    name: z.string(),
                    username: z.string(),
                }),
            }),
        ),
        message: z.string().optional(),
    }),
    execute: async ({ context }) => {
        if (!UNSPLASH_ACCESS_KEY) {
            return {
                success: false,
                photos: [],
                message: "UNSPLASH_ACCESS_KEY environment variable is not set",
            };
        }

        try {
            const params = new URLSearchParams({
                query: context.query,
                page: context.page.toString(),
                per_page: context.perPage.toString(),
                ...(context.orientation && {
                    orientation: context.orientation,
                }),
            });

            const response = await fetch(
                `https://api.unsplash.com/search/photos?${params}`,
                {
                    headers: {
                        "Accept-Version": "v1",
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                    },
                },
            );

            if (!response.ok) {
                const error = await response.text();
                return {
                    success: false,
                    photos: [],
                    message: `Unsplash API error: ${response.status} - ${error}`,
                };
            }

            const data = await response.json();

            return {
                success: true,
                photos: data.results.map((photo: any) => ({
                    id: photo.id,
                    description:
                        photo.description ||
                        photo.alt_description ||
                        "No description",
                    urls: photo.urls,
                    width: photo.width,
                    height: photo.height,
                    user: {
                        name: photo.user.name,
                        username: photo.user.username,
                    },
                })),
            };
        } catch (error) {
            return {
                success: false,
                photos: [],
                message: `Error searching Unsplash: ${error}`,
            };
        }
    },
});

/**
 * Get a single photo URL from Unsplash based on a search query
 * Returns the first matching photo's regular URL
 */
export const getUnsplashImageUrl = createTool({
    id: "get-unsplash-image-url",
    description:
        "Get a single image URL from Unsplash based on a search query. Returns the first matching photo's URL.",
    inputSchema: z.object({
        query: z.string().describe("Search keyword for finding a photo"),
        orientation: z
            .enum(["landscape", "portrait", "squarish"])
            .default("landscape")
            .describe("Photo orientation"),
        size: z
            .enum(["raw", "full", "regular", "small", "thumb"])
            .default("regular")
            .describe("Image size to return"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        url: z.string().optional(),
        attribution: z.string().optional(),
        message: z.string().optional(),
    }),
    execute: async ({ context }) => {
        if (!UNSPLASH_ACCESS_KEY) {
            // Return a fallback placeholder image
            return {
                success: true,
                url: `https://placehold.co/1200x630/1a1a2e/eee?text=${encodeURIComponent(context.query)}`,
                attribution: "Placeholder image",
            };
        }

        try {
            const params = new URLSearchParams({
                query: context.query,
                per_page: "1",
                orientation: context.orientation,
            });

            const response = await fetch(
                `https://api.unsplash.com/search/photos?${params}`,
                {
                    headers: {
                        "Accept-Version": "v1",
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                    },
                },
            );

            if (!response.ok) {
                return {
                    success: false,
                    url: `https://placehold.co/1200x630/1a1a2e/eee?text=${encodeURIComponent(context.query)}`,
                    message: `Unsplash API error: ${response.status}`,
                };
            }

            const data = await response.json();

            if (data.results.length === 0) {
                return {
                    success: true,
                    url: `https://placehold.co/1200x630/1a1a2e/eee?text=${encodeURIComponent(context.query)}`,
                    attribution: "No photos found, using placeholder",
                };
            }

            const photo = data.results[0];
            return {
                success: true,
                url: photo.urls[context.size],
                attribution: `Photo by ${photo.user.name} on Unsplash`,
            };
        } catch (error) {
            return {
                success: false,
                url: `https://placehold.co/1200x630/1a1a2e/eee?text=${encodeURIComponent(context.query)}`,
                message: `Error: ${error}`,
            };
        }
    },
});
