import { getSupabaseClient } from "@/lib/supabase/client";
import type { CourseWithProgress, ChapterWithProgress } from "@/types/course";
import type { Database } from "@/types/database.types";

type CourseWithChapters = Database["public"]["Tables"]["courses"]["Row"] & {
    chapters: Array<{ id: string; completed: boolean }>;
};

// Fetch user's courses with progress
export async function getUserCourses(): Promise<CourseWithProgress[]> {
    const supabase = getSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data: courses, error } = await supabase
        .from("courses")
        .select(
            `
      *,
      chapters:chapters(id, completed)
    `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return ((courses as CourseWithChapters[]) || []).map((course) => {
        const chapters = course.chapters || [];
        const completedChapters = chapters.filter(
            (c: { completed: boolean }) => c.completed,
        ).length;
        const progress =
            chapters.length > 0
                ? Math.round((completedChapters / chapters.length) * 100)
                : 0;

        return {
            id: course.id,
            title: course.title,
            description: course.description,
            imageUrl: course.image_url,
            totalTimeHours: course.total_time_hours,
            difficulty: course.difficulty as "easy" | "medium" | "hard",
            language: course.language as "en" | "id",
            status: course.status as "creating" | "finished" | "failed",
            chaptersCount: chapters.length,
            completedChapters,
            progress,
            createdAt: course.created_at || new Date().toISOString(),
        };
    });
}

// Fetch a single course with chapters
export async function getCourse(courseId: string) {
    const supabase = getSupabaseClient();

    const { data: course, error } = await supabase
        .from("courses")
        .select(
            `
      *,
      chapters:chapters(
        id,
        index,
        caption,
        summary,
        time_minutes,
        completed,
        questions:questions(id)
      )
    `,
        )
        .eq("id", courseId)
        .single();

    if (error) {
        throw error;
    }

    return course;
}

type ChapterWithUserProgress =
    Database["public"]["Tables"]["chapters"]["Row"] & {
        user_progress: Array<{ quiz_score: number | null }> | null;
    };

// Fetch chapters for a course with progress
export async function getCourseChapters(
    courseId: string,
): Promise<ChapterWithProgress[]> {
    const supabase = getSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data: chapters, error } = await supabase
        .from("chapters")
        .select(
            `
      id,
      index,
      caption,
      summary,
      time_minutes,
      completed,
      user_progress:user_progress(quiz_score)
    `,
        )
        .eq("course_id", courseId)
        .order("index", { ascending: true });

    if (error) {
        throw error;
    }

    return ((chapters as ChapterWithUserProgress[]) || []).map((chapter) => {
        const progress = chapter.user_progress?.[0];
        return {
            id: chapter.id,
            index: chapter.index,
            caption: chapter.caption,
            summary: chapter.summary,
            timeMinutes: chapter.time_minutes,
            completed: chapter.completed ?? false,
            quizScore: progress?.quiz_score ?? null,
        };
    });
}

// Fetch a chapter with full content
export async function getChapter(chapterId: string) {
    const supabase = getSupabaseClient();

    const { data: chapter, error } = await supabase
        .from("chapters")
        .select(
            `
      *,
      questions:questions(*),
      course:courses(id, title, description, difficulty, language)
    `,
        )
        .eq("id", chapterId)
        .single();

    if (error) {
        throw error;
    }

    return chapter;
}

// Update chapter completion
export async function markChapterCompleted(
    chapterId: string,
    completed: boolean,
) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from("chapters")
        .update({ completed })
        .eq("id", chapterId);

    if (error) {
        throw error;
    }
}

// Update quiz progress
export async function updateQuizProgress(
    courseId: string,
    chapterId: string,
    score: number,
) {
    const supabase = getSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    const { error } = await supabase.from("user_progress").upsert(
        {
            user_id: user.id,
            course_id: courseId,
            chapter_id: chapterId,
            completed: true,
            quiz_score: score,
            quiz_completed_at: new Date().toISOString(),
        },
        {
            onConflict: "user_id,chapter_id",
        },
    );

    if (error) {
        throw error;
    }

    // Also mark chapter as completed
    await markChapterCompleted(chapterId, true);
}

// Create a new course (initial record)
export async function createCourseRecord(data: {
    title: string;
    description?: string;
    totalTimeHours?: number;
    difficulty: "easy" | "medium" | "hard";
    language: "en" | "id";
}): Promise<Database["public"]["Tables"]["courses"]["Row"]> {
    const supabase = getSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data: course, error } = await supabase
        .from("courses")
        .insert({
            user_id: user.id,
            title: data.title,
            description: data.description,
            total_time_hours: data.totalTimeHours,
            difficulty: data.difficulty,
            language: data.language,
            status: "creating",
        })
        .select()
        .single();

    if (error || !course) {
        throw error || new Error("Failed to create course");
    }

    return course;
}

// Update course status
export async function updateCourseStatus(
    courseId: string,
    status: "creating" | "finished" | "failed",
    errorMessage?: string,
) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from("courses")
        .update({
            status,
            error_message: errorMessage,
        })
        .eq("id", courseId);

    if (error) {
        throw error;
    }
}

// Subscribe to course status changes
export function subscribeToCourseStatus(
    courseId: string,
    callback: (
        status: "creating" | "finished" | "failed",
        error?: string,
    ) => void,
) {
    const supabase = getSupabaseClient();

    const channel = supabase
        .channel(`course-${courseId}`)
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "courses",
                filter: `id=eq.${courseId}`,
            },
            (payload) => {
                const { status, error_message } = payload.new as {
                    status: "creating" | "finished" | "failed";
                    error_message?: string;
                };
                callback(status, error_message ?? undefined);
            },
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// Get user profile
export async function getUserProfile(): Promise<
    Database["public"]["Tables"]["profiles"]["Row"] | null
> {
    const supabase = getSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        // If profile doesn't exist, return null instead of throwing
        if (error.code === "PGRST116") {
            return null;
        }
        throw error;
    }

    return profile;
}

// Update user profile (creates if doesn't exist)
export async function updateUserProfile(data: {
    full_name?: string;
    avatar_url?: string;
}) {
    const supabase = getSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First check if profile exists
    const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
            .from("profiles")
            .update(data)
            .eq("id", user.id);

        if (error) {
            throw error;
        }
    } else {
        // Create new profile
        const { error } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            ...data,
        });

        if (error) {
            throw error;
        }
    }
}
