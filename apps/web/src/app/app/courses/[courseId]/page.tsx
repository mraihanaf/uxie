"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getCourse, getCourseChapters } from "@/lib/api/supabase-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Loader2,
  Play,
  CheckCircle,
  Lock,
  ChevronRight,
} from "lucide-react";
import type { ChapterWithProgress } from "@/types/course";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<{
    id: string;
    title: string;
    description: string | null;
    difficulty: string | null;
    language: string | null;
    image_url: string | null;
    chapters?: Array<{
      id: string;
      index: number;
      caption: string;
      summary: string | null;
      time_minutes: number | null;
      completed: boolean | null;
    }>;
  } | null>(null);
  const [chapters, setChapters] = useState<ChapterWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const [courseData, chaptersData] = await Promise.all([
          getCourse(courseId),
          getCourseChapters(courseId),
        ]);
        setCourse(courseData);
        setChapters(chaptersData);
      } catch (err) {
        console.error("Failed to load course:", err);
        setError("Failed to load course. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-[var(--accent-lilac)]" />
          <p className="text-[var(--foreground-muted)]">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || "Course not found"}</p>
        <Link href="/app">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const completedChapters = chapters.filter((c) => c.completed).length;
  const progress =
    chapters.length > 0
      ? Math.round((completedChapters / chapters.length) * 100)
      : 0;
  const totalTime = chapters.reduce((sum, c) => sum + (c.timeMinutes || 0), 0);
  const nextChapter = chapters.find((c) => !c.completed) || chapters[0];

  const difficultyColors = {
    easy: "green",
    medium: "yellow",
    hard: "pink",
  } as const;

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        href="/app/courses"
        className="text-sm text-[var(--foreground-muted)] hover:text-foreground flex items-center gap-1"
      >
        <ArrowLeft className="size-4" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-raised overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-[var(--pastel-lilac)] to-[var(--pastel-blue)] flex items-center justify-center overflow-hidden">
              {course.image_url ? (
                <Image
                  src={course.image_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <BookOpen className="size-20 text-[var(--accent-lilac)]" />
              )}
            </div>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                  <p className="text-[var(--foreground-secondary)]">
                    {course.description || "No description available"}
                  </p>
                </div>
                <Badge
                  variant={
                    difficultyColors[
                      course.difficulty as keyof typeof difficultyColors
                    ]
                  }
                  size="lg"
                >
                  {course.difficulty}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--foreground-muted)]">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-4" />
                  {chapters.length} chapters
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {Math.round(totalTime / 60)} hours
                </span>
                <span>
                  {course.language === "en" ? "🇺🇸 English" : "🇮🇩 Indonesian"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <div>
          <Card className="border-0 shadow-raised h-full">
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--accent-lilac)] mb-1">
                  {progress}%
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {completedChapters} of {chapters.length} chapters completed
                </p>
              </div>

              <Progress value={progress} variant="lilac" size="lg" />

              {nextChapter && (
                <Link
                  href={`/app/courses/${courseId}/chapters/${nextChapter.index}`}
                >
                  <Button className="w-full gap-2">
                    {completedChapters === 0 ? (
                      <>
                        <Play className="size-4" />
                        Start Learning
                      </>
                    ) : progress === 100 ? (
                      <>
                        <CheckCircle className="size-4" />
                        Review Course
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Continue Learning
                      </>
                    )}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chapters List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Chapters</h2>
        <div className="space-y-3">
          {chapters.map((chapter, index) => {
            const isUnlocked = index === 0 || chapters[index - 1]?.completed;

            return (
              <Link
                key={chapter.id}
                href={
                  isUnlocked
                    ? `/app/courses/${courseId}/chapters/${chapter.index}`
                    : "#"
                }
                className={!isUnlocked ? "cursor-not-allowed" : ""}
              >
                <Card
                  className={`border-0 transition-all ${
                    chapter.completed
                      ? "bg-[var(--pastel-green)]/30"
                      : isUnlocked
                        ? "shadow-raised hover:shadow-floating"
                        : "opacity-60"
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
                          chapter.completed
                            ? "bg-[var(--accent-green)] text-white"
                            : isUnlocked
                              ? "bg-[var(--pastel-lilac)] text-[var(--accent-lilac)]"
                              : "bg-muted text-[var(--foreground-muted)]"
                        }`}
                      >
                        {chapter.completed ? (
                          <CheckCircle className="size-6" />
                        ) : !isUnlocked ? (
                          <Lock className="size-5" />
                        ) : (
                          <span className="font-bold">{chapter.index + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-1">
                          {chapter.caption}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
                          {chapter.timeMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {chapter.timeMinutes} min
                            </span>
                          )}
                          {chapter.quizScore !== null && (
                            <span className="flex items-center gap-1 text-[var(--accent-green)]">
                              <CheckCircle className="size-3.5" />
                              Quiz: {chapter.quizScore}%
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        className={`size-5 ${
                          isUnlocked
                            ? "text-[var(--foreground-muted)]"
                            : "text-border"
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
