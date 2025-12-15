/**
 * Supabase Service
 *
 * Handles all database operations for course persistence.
 * Uses the Supabase REST API with service role key for backend operations.
 */

import type {
    FullCourse,
    FullChapter,
} from "../workflows/course-creation-workflow";
import type { Quiz, MCQuestion, OpenTextQuestion } from "../agents/quiz-agent";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL environment variable is not set");
}

if (!SUPABASE_SERVICE_KEY) {
    throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY environment variable is not set",
    );
}

// Validate JWT format (should have 3 parts separated by dots)
if (SUPABASE_SERVICE_KEY.split(".").length !== 3) {
    throw new Error(
        `SUPABASE_SERVICE_ROLE_KEY appears to be invalid. ` +
            `Expected a JWT token (3 parts separated by dots), got: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`,
    );
}

// Types for database records
export interface CourseRecord {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    image_query: string | null;
    total_time_hours: number | null;
    difficulty: "easy" | "medium" | "hard";
    language: "en" | "id";
    status: "creating" | "finished" | "failed";
    error_message: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChapterRecord {
    id: string;
    course_id: string;
    index: number;
    caption: string;
    content_points: string[];
    jsx_content: string;
    key_takeaways: string[];
    time_minutes: number | null;
    image_url: string | null;
    note: string | null;
    created_at: string;
}

export interface QuestionRecord {
    id: string;
    chapter_id: string;
    index: number;
    type: "multiple_choice" | "open_text";
    question: string;
    answer_a: string | null;
    answer_b: string | null;
    answer_c: string | null;
    answer_d: string | null;
    correct_answer: string;
    explanation: string | null;
    grading_criteria: string | null;
    created_at: string;
}

export interface UserProgressRecord {
    id: string;
    user_id: string;
    course_id: string;
    chapter_id: string;
    completed: boolean;
    quiz_score: number | null;
    quiz_total: number | null;
    quiz_completed_at: string | null;
    time_spent_seconds: number;
    created_at: string;
    updated_at: string;
}

/**
 * Helper function to make Supabase REST API requests
 */
async function supabaseRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            Prefer:
                options.method === "POST"
                    ? "return=representation"
                    : "return=minimal",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(
            `Supabase request failed: ${response.status} - ${error}`,
        );
    }

    // Return empty for DELETE or minimal response
    const headers = options.headers as Record<string, string> | undefined;
    if (response.status === 204 || headers?.["Prefer"] === "return=minimal") {
        return {} as T;
    }

    return response.json();
}

/**
 * Create a new course record
 */
export async function createCourseRecord(params: {
    userId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    imageQuery?: string;
    totalTimeHours?: number;
    difficulty: "easy" | "medium" | "hard";
    language: "en" | "id";
}): Promise<CourseRecord> {
    const records = await supabaseRequest<CourseRecord[]>("courses", {
        method: "POST",
        body: JSON.stringify({
            user_id: params.userId,
            title: params.title,
            description: params.description || null,
            image_url: params.imageUrl || null,
            image_query: params.imageQuery || null,
            total_time_hours: params.totalTimeHours || null,
            difficulty: params.difficulty,
            language: params.language,
            status: "creating",
        }),
        headers: {
            Prefer: "return=representation",
        },
    });

    return records[0];
}

/**
 * Update course status
 */
export async function updateCourseStatus(
    courseId: string,
    status: "creating" | "finished" | "failed",
    errorMessage?: string,
): Promise<void> {
    await supabaseRequest(`courses?id=eq.${courseId}`, {
        method: "PATCH",
        body: JSON.stringify({
            status,
            error_message: errorMessage || null,
            updated_at: new Date().toISOString(),
        }),
        headers: {
            Prefer: "return=minimal",
        },
    });
}

/**
 * Update course info after generation
 */
export async function updateCourseInfo(
    courseId: string,
    info: {
        title?: string;
        description?: string;
        imageUrl?: string;
        totalTimeHours?: number;
    },
): Promise<void> {
    const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (info.title) updates.title = info.title;
    if (info.description) updates.description = info.description;
    if (info.imageUrl) updates.image_url = info.imageUrl;
    if (info.totalTimeHours) updates.total_time_hours = info.totalTimeHours;

    await supabaseRequest(`courses?id=eq.${courseId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        headers: {
            Prefer: "return=minimal",
        },
    });
}

/**
 * Get a course by ID
 */
export async function getCourse(
    courseId: string,
): Promise<CourseRecord | null> {
    const records = await supabaseRequest<CourseRecord[]>(
        `courses?id=eq.${courseId}&select=*`,
    );
    return records[0] || null;
}

/**
 * Get all courses for a user
 */
export async function getUserCourses(userId: string): Promise<CourseRecord[]> {
    return supabaseRequest<CourseRecord[]>(
        `courses?user_id=eq.${userId}&select=*&order=created_at.desc`,
    );
}

/**
 * Save a chapter
 */
export async function saveChapter(params: {
    courseId: string;
    index: number;
    caption: string;
    contentPoints: string[];
    jsxContent: string;
    keyTakeaways: string[];
    timeMinutes?: number;
    imageUrl?: string;
    note?: string;
}): Promise<ChapterRecord> {
    const records = await supabaseRequest<ChapterRecord[]>("chapters", {
        method: "POST",
        body: JSON.stringify({
            course_id: params.courseId,
            index: params.index,
            caption: params.caption,
            content_points: params.contentPoints,
            jsx_content: params.jsxContent,
            key_takeaways: params.keyTakeaways,
            time_minutes: params.timeMinutes || null,
            image_url: params.imageUrl || null,
            note: params.note || null,
        }),
        headers: {
            Prefer: "return=representation",
        },
    });

    return records[0];
}

/**
 * Get chapters for a course
 */
export async function getCourseChapters(
    courseId: string,
): Promise<ChapterRecord[]> {
    return supabaseRequest<ChapterRecord[]>(
        `chapters?course_id=eq.${courseId}&select=*&order=index.asc`,
    );
}

/**
 * Save questions for a chapter
 */
export async function saveQuestions(
    chapterId: string,
    questions: (MCQuestion | OpenTextQuestion)[],
): Promise<QuestionRecord[]> {
    const questionRecords = questions.map((q, index) => ({
        chapter_id: chapterId,
        index,
        type: q.type,
        question: q.question,
        answer_a:
            q.type === "multiple_choice" ? (q as MCQuestion).answerA : null,
        answer_b:
            q.type === "multiple_choice" ? (q as MCQuestion).answerB : null,
        answer_c:
            q.type === "multiple_choice" ? (q as MCQuestion).answerC : null,
        answer_d:
            q.type === "multiple_choice" ? (q as MCQuestion).answerD : null,
        correct_answer: q.correctAnswer,
        explanation:
            q.type === "multiple_choice" ? (q as MCQuestion).explanation : null,
        grading_criteria:
            q.type === "open_text"
                ? (q as OpenTextQuestion).gradingCriteria
                : null,
    }));

    return supabaseRequest<QuestionRecord[]>("questions", {
        method: "POST",
        body: JSON.stringify(questionRecords),
        headers: {
            Prefer: "return=representation",
        },
    });
}

/**
 * Get questions for a chapter
 */
export async function getChapterQuestions(
    chapterId: string,
): Promise<QuestionRecord[]> {
    return supabaseRequest<QuestionRecord[]>(
        `questions?chapter_id=eq.${chapterId}&select=*&order=index.asc`,
    );
}

/**
 * Save or update user progress
 */
export async function saveUserProgress(params: {
    userId: string;
    courseId: string;
    chapterId: string;
    completed?: boolean;
    quizScore?: number;
    quizTotal?: number;
    timeSpentSeconds?: number;
}): Promise<void> {
    // Use upsert with ON CONFLICT
    await supabaseRequest("user_progress", {
        method: "POST",
        body: JSON.stringify({
            user_id: params.userId,
            course_id: params.courseId,
            chapter_id: params.chapterId,
            completed: params.completed || false,
            quiz_score: params.quizScore || null,
            quiz_total: params.quizTotal || null,
            quiz_completed_at:
                params.quizScore !== undefined
                    ? new Date().toISOString()
                    : null,
            time_spent_seconds: params.timeSpentSeconds || 0,
        }),
        headers: {
            Prefer: "return=minimal,resolution=merge-duplicates",
        },
    });
}

/**
 * Get user progress for a course
 */
export async function getUserCourseProgress(
    userId: string,
    courseId: string,
): Promise<UserProgressRecord[]> {
    return supabaseRequest<UserProgressRecord[]>(
        `user_progress?user_id=eq.${userId}&course_id=eq.${courseId}&select=*`,
    );
}

/**
 * Save a complete course with all chapters and questions
 */
export async function saveFullCourse(
    userId: string,
    course: FullCourse,
): Promise<{ courseId: string; chapterIds: string[] }> {
    // Create or update course record
    let courseId = course.id;

    if (!courseId) {
        // Calculate total time
        const totalMinutes = course.chapters.reduce(
            (sum, ch) => sum + (ch.chapter.timeMinutes || 0),
            0,
        );

        const courseRecord = await createCourseRecord({
            userId,
            title: course.info.title,
            description: course.info.description,
            imageUrl: course.info.imageUrl,
            imageQuery: course.info.imageQuery,
            totalTimeHours: totalMinutes / 60,
            difficulty: "medium", // Would need to be passed in
            language: "en", // Would need to be passed in
        });
        courseId = courseRecord.id;
    } else {
        // Update existing course
        await updateCourseInfo(courseId, {
            title: course.info.title,
            description: course.info.description,
            imageUrl: course.info.imageUrl,
        });
    }

    // Save chapters and questions
    const chapterIds: string[] = [];

    for (let i = 0; i < course.chapters.length; i++) {
        const fullChapter = course.chapters[i];

        // Save chapter
        const chapterRecord = await saveChapter({
            courseId,
            index: i,
            caption: fullChapter.chapter.caption,
            contentPoints: fullChapter.chapter.content,
            jsxContent: fullChapter.content.jsxCode,
            keyTakeaways: fullChapter.content.keyTakeaways,
            timeMinutes: fullChapter.chapter.timeMinutes,
            imageUrl: fullChapter.imageUrl,
            note: fullChapter.chapter.note,
        });

        chapterIds.push(chapterRecord.id);

        // Save questions
        if (fullChapter.quiz.questions.length > 0) {
            await saveQuestions(chapterRecord.id, fullChapter.quiz.questions);
        }
    }

    // Update course status to finished
    await updateCourseStatus(courseId, "finished");

    return { courseId, chapterIds };
}

/**
 * Load a complete course with all chapters and questions
 */
export async function loadFullCourse(courseId: string): Promise<{
    course: CourseRecord;
    chapters: Array<{
        chapter: ChapterRecord;
        questions: QuestionRecord[];
    }>;
} | null> {
    const course = await getCourse(courseId);
    if (!course) return null;

    const chapters = await getCourseChapters(courseId);
    const chaptersWithQuestions = await Promise.all(
        chapters.map(async (chapter) => ({
            chapter,
            questions: await getChapterQuestions(chapter.id),
        })),
    );

    return {
        course,
        chapters: chaptersWithQuestions,
    };
}

/**
 * Delete a course and all related data (cascades)
 */
export async function deleteCourse(courseId: string): Promise<void> {
    await supabaseRequest(`courses?id=eq.${courseId}`, {
        method: "DELETE",
    });
}

/**
 * Get course progress summary using RPC function
 */
export async function getCourseProgressSummary(
    courseId: string,
    userId: string,
): Promise<{
    totalChapters: number;
    completedChapters: number;
    totalQuizScore: number;
    totalQuizPossible: number;
    progressPercentage: number;
} | null> {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/get_course_progress`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: SUPABASE_SERVICE_KEY,
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                },
                body: JSON.stringify({
                    p_course_id: courseId,
                    p_user_id: userId,
                }),
            },
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (!data || data.length === 0) return null;

        const result = data[0];
        return {
            totalChapters: result.total_chapters,
            completedChapters: result.completed_chapters,
            totalQuizScore: result.total_quiz_score,
            totalQuizPossible: result.total_quiz_possible,
            progressPercentage: result.progress_percentage,
        };
    } catch {
        return null;
    }
}
