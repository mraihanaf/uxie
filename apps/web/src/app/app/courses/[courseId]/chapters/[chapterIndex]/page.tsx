"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { updateQuizProgress } from "@/lib/api/supabase-data";
import {
  chatWithAgent,
  createGradeAnswerWrapper,
} from "@/lib/api/mastra-client";
import { useUser } from "@/hooks/use-user";
import ChapterViewer from "@/components/chapter/ChapterViewer";
import QuizRenderer from "@/components/quiz/QuizRenderer";
import ChapterChat from "@/components/ai/ChapterChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  BookOpen,
  Brain,
  Lightbulb,
} from "lucide-react";
import type { Question, MCQuestion, OpenTextQuestion } from "@/types/course";

interface ChapterData {
  id: string;
  course_id: string;
  index: number;
  caption: string;
  summary: string | null;
  jsx_content: string;
  key_takeaways: string[] | null;
  time_minutes: number | null;
  completed: boolean;
  questions: Array<{
    id: string;
    type: "multiple_choice" | "open_text";
    question: string;
    answer_a: string | null;
    answer_b: string | null;
    answer_c: string | null;
    answer_d: string | null;
    correct_answer: string;
    explanation: string | null;
    grading_criteria: string | null;
  }>;
  course: {
    id: string;
    title: string;
    description: string | null;
    difficulty: string;
    language: string;
  };
}

type ViewMode = "content" | "quiz" | "completed";

export default function ChapterViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const courseId = params.courseId as string;
  const chapterIndex = parseInt(params.chapterIndex as string);

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("content");
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [totalChapters, setTotalChapters] = useState(0);

  useEffect(() => {
    async function loadChapter() {
      try {
        const supabase = getSupabaseClient();

        // Get chapter with questions and course info
        const { data: chapterData, error: chapterError } = await supabase
          .from("chapters")
          .select(
            `
            *,
            questions:questions(*),
            course:courses(id, title, description, difficulty, language)
          `,
          )
          .eq("course_id", courseId)
          .eq("index", chapterIndex)
          .single();

        if (chapterError) throw chapterError;

        // Get total chapters count
        const { count } = await supabase
          .from("chapters")
          .select("*", { count: "exact", head: true })
          .eq("course_id", courseId);

        setChapter(chapterData as ChapterData);
        setTotalChapters(count || 0);

        // If already completed, show completed view
        if ((chapterData as ChapterData).completed) {
          setViewMode("completed");
        }
      } catch (err) {
        console.error("Failed to load chapter:", err);
        setError("Failed to load chapter. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [courseId, chapterIndex]);

  // Transform database questions to quiz format
  const quizQuestions: Question[] = (chapter?.questions || []).map((q) => {
    if (q.type === "multiple_choice") {
      return {
        type: "multiple_choice",
        question: q.question,
        answerA: q.answer_a || "",
        answerB: q.answer_b || "",
        answerC: q.answer_c || "",
        answerD: q.answer_d || "",
        correctAnswer: q.correct_answer as "a" | "b" | "c" | "d",
        explanation: q.explanation || "",
      } as MCQuestion;
    }
    return {
      type: "open_text",
      question: q.question,
      correctAnswer: q.correct_answer,
      gradingCriteria: q.grading_criteria || undefined,
    } as OpenTextQuestion;
  });

  const handleQuizComplete = async (
    results: unknown[],
    totalScore: number,
    maxScore: number,
  ) => {
    const percentage = Math.round((totalScore / maxScore) * 100);
    setQuizScore(percentage);

    try {
      await updateQuizProgress(courseId, chapter!.id, percentage);
      setViewMode("completed");
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  const handleChatMessage = useCallback(
    async (message: string) => {
      if (!chapter) throw new Error("Chapter not loaded");
      if (!user?.id) throw new Error("User not authenticated");

      const response = await chatWithAgent({
        message,
        courseId,
        chapterId: chapter.id,
        userId: user.id,
        chapterCaption: chapter.caption,
      });

      return response.message;
    },
    [chapter, courseId, user],
  );

  const gradeOpenText = chapter
    ? createGradeAnswerWrapper(courseId)
    : undefined;

  const handleStartQuiz = () => {
    setViewMode("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextChapter = () => {
    if (chapterIndex < totalChapters - 1) {
      router.push(`/app/courses/${courseId}/chapters/${chapterIndex + 1}`);
    } else {
      router.push(`/app/courses/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-[var(--accent-lilac)]" />
          <p className="text-[var(--foreground-muted)]">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || "Chapter not found"}</p>
        <Link href={`/app/courses/${courseId}`}>
          <Button variant="outline">Back to Course</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/app/courses/${courseId}`}
          className="text-sm text-[var(--foreground-muted)] hover:text-foreground flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to {chapter.course.title}
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="lilac">
                Chapter {chapterIndex + 1} of {totalChapters}
              </Badge>
              {chapter.completed && (
                <Badge variant="green" className="gap-1">
                  <CheckCircle className="size-3" />
                  Completed
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{chapter.caption}</h1>
          </div>
        </div>

        {/* Progress through chapter */}
        <div className="mt-4">
          <Progress
            value={viewMode === "content" ? 33 : viewMode === "quiz" ? 66 : 100}
            variant="lilac"
          />
          <div className="flex justify-between text-xs text-[var(--foreground-muted)] mt-2">
            <span
              className={
                viewMode === "content"
                  ? "font-medium text-[var(--accent-lilac)]"
                  : ""
              }
            >
              Learn
            </span>
            <span
              className={
                viewMode === "quiz"
                  ? "font-medium text-[var(--accent-lilac)]"
                  : ""
              }
            >
              Quiz
            </span>
            <span
              className={
                viewMode === "completed"
                  ? "font-medium text-[var(--accent-green)]"
                  : ""
              }
            >
              Complete
            </span>
          </div>
        </div>
      </div>

      {/* Content View */}
      {viewMode === "content" && (
        <div className="space-y-6">
          {/* Main Content */}
          <Card className="border-0 shadow-raised overflow-hidden">
            <ChapterViewer chapter={chapter} />
          </Card>

          {/* Key Takeaways */}
          {chapter.key_takeaways && chapter.key_takeaways.length > 0 && (
            <Card className="border-0 shadow-raised bg-[var(--pastel-yellow)]/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="size-5 text-[var(--accent-yellow)]" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {chapter.key_takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="size-4 text-[var(--accent-green)] mt-0.5 shrink-0" />
                      <span className="text-sm">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Take Quiz CTA */}
          {quizQuestions.length > 0 && (
            <Card className="border-0 shadow-raised bg-[var(--pastel-lilac)]/30">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-[var(--accent-lilac)] flex items-center justify-center">
                      <Brain className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Ready to test your knowledge?
                      </h3>
                      <p className="text-sm text-[var(--foreground-secondary)]">
                        Take the quiz to complete this chapter (
                        {quizQuestions.length} questions)
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleStartQuiz} className="gap-2">
                    Start Quiz
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quiz View */}
      {viewMode === "quiz" && (
        <QuizRenderer
          questions={quizQuestions}
          onComplete={handleQuizComplete}
          onGradeOpenText={gradeOpenText}
        />
      )}

      {/* Completed View */}
      {viewMode === "completed" && (
        <Card className="border-0 shadow-raised text-center py-12">
          <CardContent>
            <div className="size-20 rounded-full bg-[var(--pastel-green)] mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="size-10 text-[var(--accent-green)]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Chapter Complete!</h2>
            {quizScore !== null && (
              <p className="text-lg text-[var(--foreground-secondary)] mb-6">
                Quiz Score: {quizScore}%
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button
                variant="outline"
                onClick={() => setViewMode("content")}
                className="gap-2"
              >
                <BookOpen className="size-4" />
                Review Content
              </Button>
              <Button onClick={handleNextChapter} className="gap-2">
                {chapterIndex < totalChapters - 1 ? (
                  <>
                    Next Chapter
                    <ArrowRight className="size-4" />
                  </>
                ) : (
                  <>
                    Back to Course
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Chat */}
      <ChapterChat
        courseId={courseId}
        chapterId={chapter.id}
        chapterCaption={chapter.caption}
        onSendMessage={handleChatMessage}
      />
    </div>
  );
}
