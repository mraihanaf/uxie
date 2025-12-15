"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUserCourses } from "@/lib/api/supabase-data";
import { Card, CardContent, CardFeature } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SearchInput } from "@/components/ui/input";
import { Plus, BookOpen, Clock, Loader2, Filter } from "lucide-react";
import type { CourseWithProgress } from "@/types/course";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">(
    "all",
  );

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getUserCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    // Filter by status
    if (course.status !== "finished") return false;
    if (filter === "in-progress" && course.progress === 100) return false;
    if (filter === "completed" && course.progress < 100) return false;

    // Filter by search
    if (searchQuery) {
      return course.title.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Courses</h1>
          <p className="text-[var(--foreground-secondary)]">
            {courses.length} course{courses.length !== 1 ? "s" : ""} in your
            library
          </p>
        </div>
        <Link href="/app/create-course">
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          {(["all", "in-progress", "completed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "in-progress"
                  ? "In Progress"
                  : "Completed"}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Filter className="size-12 text-[var(--foreground-muted)] mx-auto mb-4" />
            <p className="text-[var(--foreground-secondary)]">
              {searchQuery
                ? "No courses match your search"
                : "No courses found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link key={course.id} href={`/app/courses/${course.id}`}>
              <CardFeature className="h-full">
                <div className="relative aspect-video bg-gradient-to-br from-[var(--pastel-lilac)] to-[var(--pastel-blue)] flex items-center justify-center overflow-hidden">
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
                    <Progress
                      value={course.progress}
                      variant={course.progress === 100 ? "green" : "lilac"}
                    />
                  </div>
                </div>
              </CardFeature>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
