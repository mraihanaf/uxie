/**
 * Course Creation Workflow
 *
 * Complete workflow with RAG integration:
 * 1. Process documents for RAG (add to vector store)
 * 2. InfoAgent - get title & description
 * 3. ImageAgent - get course cover image from Unsplash
 * 4. PlannerAgent - create learning path with chapters (with optional document context)
 * 5. For each chapter (ALL IN PARALLEL):
 *    - Get RAG context for chapter
 *    - ExplainerAgent + ImageAgent (in parallel within each chapter)
 *    - Then QuizAgent (after content is generated, needs content as context)
 * 6. Return complete course
 */

import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import {
    courseRequestSchema,
    type CourseRequest,
    type LearningPath,
    type CourseInfo,
} from "../schemas/course";
import { generateCourseInfo } from "../agents/info-agent";
import { generateLearningPath } from "../agents/planner-agent";
import {
    generateChapterContent,
    type JsxChapterContent,
} from "../agents/explainer-agent";
import { generateQuiz, type Quiz } from "../agents/quiz-agent";
import { getUnsplashImageUrl } from "../tools/unsplash";
import {
    getRAGContextForChapter,
    courseHasDocuments,
} from "../tools/supabase-vector";
import { processDocumentsForCourse } from "../tools/document-processor";
import { saveFullCourse, getCourse } from "../services/supabase";

// Types
export interface FullChapter {
    chapter: {
        caption: string;
        content: string[];
        timeMinutes: number;
        note?: string;
    };
    content: JsxChapterContent;
    quiz: Quiz;
    imageUrl?: string;
}

export interface FullCourse {
    id?: string;
    info: CourseInfo & { imageUrl?: string };
    chapters: FullChapter[];
}

// Schema definitions for each step
const courseInfoOutputSchema = z.object({
    title: z.string(),
    description: z.string(),
    imageQuery: z.string(),
    imageUrl: z.string().optional(),
});

const learningPathOutputSchema = z.object({
    chapters: z.array(
        z.object({
            caption: z.string(),
            content: z.array(z.string()),
            timeMinutes: z.number(),
            note: z.string().optional(),
        }),
    ),
});

const fullCourseOutputSchema = z.object({
    info: courseInfoOutputSchema,
    chapters: z.array(
        z.object({
            chapter: z.object({
                caption: z.string(),
                content: z.array(z.string()),
                timeMinutes: z.number(),
                note: z.string().optional(),
            }),
            content: z.object({
                jsxCode: z.string(),
                keyTakeaways: z.array(z.string()),
            }),
            quiz: z.object({
                questions: z.array(z.any()),
            }),
            imageUrl: z.string().optional(),
        }),
    ),
    courseId: z.string().optional(),
});

// Extended request schema with optional courseId for RAG
const extendedCourseRequestSchema = courseRequestSchema.extend({
    courseId: z
        .string()
        .optional()
        .describe("Course ID for RAG context retrieval"),
});

// Step 1: Generate course info (title, description, image query)
const generateInfoStep = createStep({
    id: "generate-info",
    description: "Generate course title, description, and image query",
    inputSchema: extendedCourseRequestSchema,
    outputSchema: z.object({
        request: extendedCourseRequestSchema,
        info: courseInfoOutputSchema,
    }),
    execute: async ({ inputData }) => {
        if (!inputData) throw new Error("Input data not found");

        console.log("[Step 1] Generating course info...");

        const courseInfo = await generateCourseInfo({
            query: inputData.query,
            timeHours: inputData.timeHours,
            difficulty: inputData.difficulty,
            language: inputData.language,
        });

        const info = courseInfo || {
            title: "Untitled Course",
            description: "",
            imageQuery: inputData.query,
        };

        console.log(`[Step 1] Course info: ${info.title}`);

        return {
            request: inputData,
            info,
        };
    },
});

// Step 2: Get cover image and generate learning path (parallel)
const generatePlanStep = createStep({
    id: "generate-plan",
    description: "Get cover image and generate learning path in parallel",
    inputSchema: z.object({
        request: extendedCourseRequestSchema,
        info: courseInfoOutputSchema,
    }),
    outputSchema: z.object({
        request: extendedCourseRequestSchema,
        info: courseInfoOutputSchema,
        learningPath: learningPathOutputSchema,
    }),
    execute: async ({ inputData }) => {
        if (!inputData) throw new Error("Input data not found");

        console.log(
            "[Step 2] Getting cover image and generating learning path...",
        );

        const [coverImageResult, learningPathResult] = await Promise.all([
            getUnsplashImageUrl.execute!({
                context: {
                    query: inputData.info.imageQuery || inputData.request.query,
                    orientation: "landscape" as const,
                    size: "regular" as const,
                },
                runId: "",
                runtimeContext: {} as any,
            }),
            generateLearningPath({
                query: inputData.request.query,
                timeHours: inputData.request.timeHours,
                difficulty: inputData.request.difficulty,
                language: inputData.request.language,
            }),
        ]);

        console.log(
            `[Step 2] Learning path: ${learningPathResult?.chapters.length || 0} chapters`,
        );

        return {
            request: inputData.request,
            info: {
                ...inputData.info,
                imageUrl: coverImageResult.url,
            },
            learningPath: learningPathResult || { chapters: [] },
        };
    },
});

// Step 3: Generate all chapter content, images, and quizzes
const generateChaptersStep = createStep({
    id: "generate-chapters",
    description: "Generate content, images, and quizzes for all chapters",
    inputSchema: z.object({
        request: extendedCourseRequestSchema,
        info: courseInfoOutputSchema,
        learningPath: learningPathOutputSchema,
    }),
    outputSchema: fullCourseOutputSchema,
    execute: async ({ inputData }) => {
        if (!inputData) throw new Error("Input data not found");

        const { request, info, learningPath } = inputData;

        if (learningPath.chapters.length === 0) {
            throw new Error("No chapters generated");
        }

        console.log(
            `[Step 3] Processing ${learningPath.chapters.length} chapters in parallel...`,
        );

        const allChaptersStr = learningPath.chapters
            .map(
                (ch, idx) =>
                    `Chapter ${idx + 1}: ${ch.caption}\nContent: ${ch.content.join(", ")}`,
            )
            .join("\n\n");

        // Check if we have documents for RAG context
        const hasDocuments = request.courseId
            ? await courseHasDocuments(request.courseId)
            : false;

        // Process ALL chapters in parallel (like Nexora)
        const chapterPromises = learningPath.chapters.map(
            async (chapter, index) => {
                console.log(
                    `[Chapter ${index + 1}] Processing: ${chapter.caption}`,
                );

                // Get RAG context for this chapter if documents are available
                let ragContext: string[] = [];
                if (hasDocuments && request.courseId) {
                    ragContext = await getRAGContextForChapter({
                        courseId: request.courseId,
                        chapterCaption: chapter.caption,
                        contentPoints: chapter.content,
                    });
                    if (ragContext.length > 0) {
                        console.log(
                            `[Chapter ${index + 1}] Found ${ragContext.length} RAG context items`,
                        );
                    }
                }

                // Step 3a: Run ExplainerAgent and ImageAgent in parallel
                const [chapterContent, chapterImageResult] = await Promise.all([
                    generateChapterContent({
                        chapterIndex: index,
                        chapterCaption: chapter.caption,
                        chapterContent: chapter.content,
                        chapterNote: chapter.note,
                        timeMinutes: chapter.timeMinutes,
                        allChapters: allChaptersStr,
                        userQuery: request.query,
                        difficulty: request.difficulty,
                        language: request.language,
                        ragContext,
                    }),
                    getUnsplashImageUrl.execute!({
                        context: {
                            query: `${chapter.caption} education learning`,
                            orientation: "landscape" as const,
                            size: "regular" as const,
                        },
                        runId: "",
                        runtimeContext: {} as any,
                    }),
                ]);

                console.log(
                    `[Chapter ${index + 1}] Content generated, getting quiz...`,
                );

                // Step 3b: Generate quiz AFTER content (needs content as context)
                const quiz = await generateQuiz({
                    chapterCaption: chapter.caption,
                    chapterContent:
                        chapterContent?.jsxCode || chapter.content.join("\n"),
                    timeMinutes: chapter.timeMinutes,
                    userQuery: request.query,
                    difficulty: request.difficulty,
                    language: request.language,
                });

                console.log(`[Chapter ${index + 1}] Complete`);

                return {
                    chapter,
                    content: chapterContent || {
                        jsxCode: "",
                        keyTakeaways: [],
                    },
                    quiz: quiz || { questions: [] },
                    imageUrl: chapterImageResult.url,
                };
            },
        );

        const chapters = await Promise.all(chapterPromises);

        console.log("[Step 3] All chapters complete!");

        return {
            info,
            chapters,
            // Include courseId in output so save step can access it
            courseId: request.courseId,
        };
    },
});

// Step 4: Save course to database (async, runs after generation completes)
const saveCourseStep = createStep({
    id: "save-course",
    description: "Save complete course with chapters and questions to database",
    inputSchema: fullCourseOutputSchema,
    outputSchema: fullCourseOutputSchema,
    execute: async ({ inputData }) => {
        if (!inputData) throw new Error("Input data not found");

        // Get the full course data from previous step (generateChaptersStep)
        const courseData = inputData as {
            info: CourseInfo & { imageUrl?: string };
            chapters: FullChapter[];
            courseId?: string;
        };

        // Check if courseId is available
        if (!courseData.courseId) {
            console.log("[Step 4] Skipping save - courseId not provided");
            return courseData;
        }

        const courseId = courseData.courseId;

        console.log(`[Step 4] Saving course ${courseId} to database...`);

        try {
            // Get the course record to retrieve userId
            const courseRecord = await getCourse(courseId);

            if (!courseRecord) {
                console.error(
                    `[Step 4] Course ${courseId} not found in database`,
                );
                return courseData;
            }

            const userId = courseRecord.user_id;

            // Construct FullCourse object for saving
            const fullCourse: FullCourse = {
                id: courseId,
                info: courseData.info,
                chapters: courseData.chapters,
            };

            // Save the full course
            await saveFullCourse(userId, fullCourse);
            console.log(`[Step 4] Course ${courseId} saved successfully!`);
        } catch (error) {
            console.error(`[Step 4] Failed to save course ${courseId}:`, error);
            // Don't throw - we still want to return the course data even if save fails
            // The client can retry saving if needed
        }

        return courseData;
    },
});

// Main course creation workflow - 3 steps following Nexora
const courseCreationWorkflow = createWorkflow({
    id: "course-creation",
    inputSchema: extendedCourseRequestSchema,
    outputSchema: fullCourseOutputSchema,
})
    .then(generateInfoStep)
    .then(generatePlanStep)
    .then(generateChaptersStep)
    .then(saveCourseStep);

courseCreationWorkflow.commit();

export { courseCreationWorkflow };

/**
 * Process uploaded documents for RAG using Mastra aligned helper
 */
async function processDocumentsForRAG(
    courseId: string,
    documentIds?: string[],
): Promise<{ totalChunks: number }> {
    if (!documentIds || documentIds.length === 0) {
        console.log("[Documents] No documents to process");
        return { totalChunks: 0 };
    }

    console.log(`[Documents] Processing ${documentIds.length} documents...`);

    const result = await processDocumentsForCourse(courseId, documentIds);

    console.log(`[Documents] Processed: ${result.totalChunks} total chunks`);

    return result;
}

/**
 * Execute the full course creation process with RAG integration
 */
export async function createCourse(params: {
    request: CourseRequest;
    courseId: string;
    userId: string;
}): Promise<FullCourse> {
    const { request, courseId, userId } = params;
    console.log(
        `[Course Creation] Starting for user ${userId}, course ${courseId}`,
    );

    // Step 0: Process documents for RAG if provided
    if (request.documentIds && request.documentIds.length > 0) {
        await processDocumentsForRAG(courseId, request.documentIds);
    }

    // Step 1: Generate course info (title, description)
    console.log("[Course Creation] Step 1: Generating course info...");
    const courseInfo = await generateCourseInfo({
        query: request.query,
        timeHours: request.timeHours,
        difficulty: request.difficulty,
        language: request.language,
    });

    const info: CourseInfo = courseInfo || {
        title: "Untitled Course",
        description: "",
        imageQuery: request.query,
    };

    console.log(`[Course Creation] Course info: ${info.title}`);

    // Step 2: Get course cover image from Unsplash (parallel with planner)
    // Step 3: Generate learning path with chapters
    console.log(
        "[Course Creation] Step 2-3: Getting cover image and generating learning path...",
    );

    // Check if we have documents for planner context
    const hasDocuments = await courseHasDocuments(courseId);
    let documentContext: string | undefined;

    if (hasDocuments) {
        // Get some general context for the planner
        const ragContext = await getRAGContextForChapter({
            courseId,
            chapterCaption: request.query,
            contentPoints: [request.query],
        });
        if (ragContext.length > 0) {
            documentContext = ragContext.slice(0, 3).join("\n\n---\n\n");
        }
    }

    const [coverImageResult, learningPathResult] = await Promise.all([
        getUnsplashImageUrl.execute!({
            context: {
                query: info.imageQuery || request.query,
                orientation: "landscape" as const,
                size: "regular" as const,
            },
            runId: "",
            runtimeContext: {} as any,
        }),
        generateLearningPath({
            query: request.query,
            timeHours: request.timeHours,
            difficulty: request.difficulty,
            language: request.language,
            documentContext,
        }),
    ]);

    const courseImageUrl = coverImageResult.url;
    const learningPath: LearningPath = learningPathResult || { chapters: [] };

    console.log(
        `[Course Creation] Learning path: ${learningPath.chapters.length} chapters`,
    );

    if (learningPath.chapters.length === 0) {
        throw new Error("No chapters generated");
    }

    // Create chapters string for context (passed to explainer)
    const allChaptersStr = learningPath.chapters
        .map(
            (ch, idx) =>
                `Chapter ${idx + 1}: ${ch.caption}\nContent: ${ch.content.join(", ")}`,
        )
        .join("\n\n");

    // Step 4: Process all chapters IN PARALLEL with RAG context
    console.log("[Course Creation] Step 4: Processing chapters in parallel...");

    const chapterPromises = learningPath.chapters.map(
        async (chapter, index) => {
            console.log(
                `[Chapter ${index + 1}] Processing: ${chapter.caption}`,
            );

            // Get RAG context for this chapter if documents are available
            let ragContext: string[] = [];
            if (hasDocuments) {
                ragContext = await getRAGContextForChapter({
                    courseId,
                    chapterCaption: chapter.caption,
                    contentPoints: chapter.content,
                });
                if (ragContext.length > 0) {
                    console.log(
                        `[Chapter ${index + 1}] Found ${ragContext.length} RAG context items`,
                    );
                }
            }

            // Step 4a: Run ExplainerAgent and ImageAgent in parallel
            const [chapterContent, chapterImageResult] = await Promise.all([
                generateChapterContent({
                    chapterIndex: index,
                    chapterCaption: chapter.caption,
                    chapterContent: chapter.content,
                    chapterNote: chapter.note,
                    timeMinutes: chapter.timeMinutes,
                    allChapters: allChaptersStr,
                    userQuery: request.query,
                    difficulty: request.difficulty,
                    language: request.language,
                    ragContext,
                }),
                getUnsplashImageUrl.execute!({
                    context: {
                        query: `${chapter.caption} education learning`,
                        orientation: "landscape" as const,
                        size: "regular" as const,
                    },
                    runId: "",
                    runtimeContext: {} as any,
                }),
            ]);

            console.log(
                `[Chapter ${index + 1}] Content generated, getting quiz...`,
            );

            // Step 4b: Generate quiz AFTER content (needs content as context)
            const quiz = await generateQuiz({
                chapterCaption: chapter.caption,
                chapterContent:
                    chapterContent?.jsxCode || chapter.content.join("\n"),
                timeMinutes: chapter.timeMinutes,
                userQuery: request.query,
                difficulty: request.difficulty,
                language: request.language,
            });

            console.log(`[Chapter ${index + 1}] Complete`);

            return {
                chapter,
                content: chapterContent || { jsxCode: "", keyTakeaways: [] },
                quiz: quiz || { questions: [] },
                imageUrl: chapterImageResult.url,
            };
        },
    );

    // Wait for all chapters to complete
    const chapters = await Promise.all(chapterPromises);

    console.log("[Course Creation] Complete!");

    return {
        id: courseId,
        info: {
            ...info,
            imageUrl: courseImageUrl,
        },
        chapters,
    };
}

/**
 * Stream course creation progress with RAG integration
 */
export async function* createCourseWithProgress(params: {
    request: CourseRequest;
    courseId: string;
    userId: string;
}): AsyncGenerator<{
    step: string;
    progress: number;
    message?: string;
    data?: unknown;
}> {
    const { request, courseId, userId } = params;

    yield {
        step: "starting",
        progress: 0,
        message: "Starting course creation...",
    };

    // Step 0: Process documents if provided
    if (request.documentIds && request.documentIds.length > 0) {
        yield {
            step: "processing-documents",
            progress: 2,
            message: `Processing ${request.documentIds.length} documents...`,
        };
        await processDocumentsForRAG(courseId, request.documentIds);
        yield {
            step: "documents-complete",
            progress: 5,
            message: "Documents processed for RAG",
        };
    }

    // Step 1: Generate course info
    yield { step: "info", progress: 7, message: "Generating course info..." };

    const courseInfo = await generateCourseInfo({
        query: request.query,
        timeHours: request.timeHours,
        difficulty: request.difficulty,
        language: request.language,
    });

    const info: CourseInfo = courseInfo || {
        title: "Untitled Course",
        description: "",
        imageQuery: request.query,
    };

    yield {
        step: "info-complete",
        progress: 10,
        message: `Course: ${info.title}`,
        data: info,
    };

    // Step 2: Get cover image
    yield {
        step: "cover-image",
        progress: 12,
        message: "Finding cover image...",
    };

    const coverImageResult = await getUnsplashImageUrl.execute!({
        context: {
            query: info.imageQuery || request.query,
            orientation: "landscape" as const,
            size: "regular" as const,
        },
        runId: "",
        runtimeContext: {} as any,
    });

    yield {
        step: "cover-image-complete",
        progress: 15,
        message: "Cover image found",
        data: { imageUrl: coverImageResult.url },
    };

    // Check for documents
    const hasDocuments = await courseHasDocuments(courseId);
    let documentContext: string | undefined;

    if (hasDocuments) {
        const ragContext = await getRAGContextForChapter({
            courseId,
            chapterCaption: request.query,
            contentPoints: [request.query],
        });
        if (ragContext.length > 0) {
            documentContext = ragContext.slice(0, 3).join("\n\n---\n\n");
        }
    }

    // Step 3: Generate learning path
    yield {
        step: "planning",
        progress: 18,
        message: "Planning course structure...",
    };

    const learningPath = await generateLearningPath({
        query: request.query,
        timeHours: request.timeHours,
        difficulty: request.difficulty,
        language: request.language,
        documentContext,
    });

    if (!learningPath || learningPath.chapters.length === 0) {
        yield {
            step: "error",
            progress: 100,
            message: "Failed to generate chapters",
            data: { error: "No chapters generated" },
        };
        return;
    }

    yield {
        step: "planning-complete",
        progress: 25,
        message: `Planned ${learningPath.chapters.length} chapters`,
        data: {
            chapterCount: learningPath.chapters.length,
            chapters: learningPath.chapters.map((c) => c.caption),
        },
    };

    const allChaptersStr = learningPath.chapters
        .map(
            (ch, idx) =>
                `Chapter ${idx + 1}: ${ch.caption}\nContent: ${ch.content.join(", ")}`,
        )
        .join("\n\n");

    const chapters: FullChapter[] = [];
    const progressPerChapter = 70 / learningPath.chapters.length;

    // Step 4: Process each chapter
    for (let i = 0; i < learningPath.chapters.length; i++) {
        const chapter = learningPath.chapters[i];
        const baseProgress = 25 + i * progressPerChapter;

        yield {
            step: `chapter-${i + 1}-start`,
            progress: baseProgress,
            message: `Creating chapter ${i + 1}: ${chapter.caption}`,
        };

        // Get RAG context for this chapter
        let ragContext: string[] = [];
        if (hasDocuments) {
            ragContext = await getRAGContextForChapter({
                courseId,
                chapterCaption: chapter.caption,
                contentPoints: chapter.content,
            });
        }

        // Generate content and image in parallel
        const [chapterContent, chapterImageResult] = await Promise.all([
            generateChapterContent({
                chapterIndex: i,
                chapterCaption: chapter.caption,
                chapterContent: chapter.content,
                chapterNote: chapter.note,
                timeMinutes: chapter.timeMinutes,
                allChapters: allChaptersStr,
                userQuery: request.query,
                difficulty: request.difficulty,
                language: request.language,
                ragContext,
            }),
            getUnsplashImageUrl.execute!({
                context: {
                    query: `${chapter.caption} education learning`,
                    orientation: "landscape" as const,
                    size: "regular" as const,
                },
                runId: "",
                runtimeContext: {} as any,
            }),
        ]);

        yield {
            step: `chapter-${i + 1}-content`,
            progress: baseProgress + progressPerChapter * 0.6,
            message: `Chapter ${i + 1} content ready, generating quiz...`,
        };

        // Generate quiz after content
        const quiz = await generateQuiz({
            chapterCaption: chapter.caption,
            chapterContent:
                chapterContent?.jsxCode || chapter.content.join("\n"),
            timeMinutes: chapter.timeMinutes,
            userQuery: request.query,
            difficulty: request.difficulty,
            language: request.language,
        });

        chapters.push({
            chapter,
            content: chapterContent || { jsxCode: "", keyTakeaways: [] },
            quiz: quiz || { questions: [] },
            imageUrl: chapterImageResult.url,
        });

        yield {
            step: `chapter-${i + 1}-complete`,
            progress: baseProgress + progressPerChapter,
            message: `Chapter ${i + 1} complete`,
            data: {
                chapterIndex: i,
                caption: chapter.caption,
                questionCount: quiz?.questions.length || 0,
            },
        };
    }

    // Complete
    const fullCourse: FullCourse = {
        id: courseId,
        info: {
            ...info,
            imageUrl: coverImageResult.url,
        },
        chapters,
    };

    yield {
        step: "complete",
        progress: 100,
        message: "Course created successfully!",
        data: fullCourse,
    };
}
