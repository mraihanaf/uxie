"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUserCourses } from "@/lib/api/supabase-data";
import {
  Card,
  CardContent,
  CardFeature,
  CardPastel,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  BookOpen,
  Clock,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { CourseWithProgress } from "@/types/course";

export default function DashboardPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getUserCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Failed to load your courses. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const inProgressCourses = courses.filter(
    (c) => c.status === "finished" && c.progress < 100,
  );
  const completedCourses = courses.filter(
    (c) => c.status === "finished" && c.progress === 100,
  );
  const creatingCourses = courses.filter((c) => c.status === "creating");

  const difficultyColors = {
    easy: "green",
    medium: "yellow",
    hard: "pink",
  } as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-[var(--accent-lilac)]" />
          <p className="text-[var(--foreground-muted)]">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-[var(--foreground-secondary)]">
            Welcome back! Continue learning or start something new.
          </p>
        </div>
        <Link href="/app/create-course">
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 text-red-600">{error}</CardContent>
        </Card>
      )}

      {/* Empty State */}
      {courses.length === 0 && !error && (
        <CardPastel variant="lilac" className="text-center py-12">
          <div className="size-16 rounded-full bg-[var(--accent-lilac)]/20 mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="size-8 text-[var(--accent-lilac)]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-[var(--foreground-secondary)] mb-6 max-w-md mx-auto">
            Create your first AI-powered course and start your learning journey
            today.
          </p>
          <Link href="/app/create-course">
            <Button className="gap-2">
              <Plus className="size-4" />
              Create Your First Course
            </Button>
          </Link>
        </CardPastel>
      )}

      {/* Creating Courses */}
      {creatingCourses.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Creating...
          </h2>
          <div className="grid gap-4">
            {creatingCourses.map((course) => (
              <Card key={course.id} className="bg-[var(--pastel-yellow)]/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-[var(--accent-yellow)]/20 flex items-center justify-center">
                      <Loader2 className="size-6 animate-spin text-[var(--accent-yellow)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        AI is generating your course...
                      </p>
                    </div>
                    <Link href={`/app/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        View Status
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* In Progress */}
      {inProgressCourses.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Continue Learning</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.map((course) => (
              <Link key={course.id} href={`/app/courses/${course.id}`}>
                <CardFeature className="h-full">
                  <div
                    className={`relative aspect-video bg-gradient-to-br from-[var(--pastel-lilac)] to-[var(--pastel-blue)] flex items-center justify-center overflow-hidden`}
                  >
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <BookOpen className="size-12 text-[var(--accent-lilac)]" />
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-2">
                        {course.title}
                      </h3>
                      <Badge
                        variant={difficultyColors[course.difficulty]}
                        size="sm"
                      >
                        {course.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2">
                      {course.description || "No description"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
                      <span className="flex items-center gap-1">
                        <BookOpen className="size-3.5" />
                        {course.chaptersCount} chapters
                      </span>
                      {course.totalTimeHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {course.totalTimeHours}h
                        </span>
                      )}
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--foreground-muted)]">
                          Progress
                        </span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} variant="lilac" />
                    </div>
                  </div>
                </CardFeature>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completedCourses.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Completed</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.map((course) => (
              <Link key={course.id} href={`/app/courses/${course.id}`}>
                <CardFeature className="h-full opacity-80 hover:opacity-100">
                  <div className="h-24 bg-[var(--pastel-green)] flex items-center justify-center">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Completed • {course.chaptersCount} chapters
                    </p>
                  </div>
                </CardFeature>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      {courses.length > 0 && (
        <section>
          <CardPastel
            variant="blue"
            className="flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold mb-1">
                Ready to learn something new?
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Create another AI-powered course in seconds.
              </p>
            </div>
            <Link href="/app/create-course">
              <Button variant="outline" className="gap-2 bg-white">
                Create Course
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardPastel>
        </section>
      )}
    </div>
  );
}
