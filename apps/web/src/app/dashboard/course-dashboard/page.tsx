"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CourseProgress } from "@/components/course-progress";
import { ChapterList, type ChapterItem } from "@/components/chapter-list";
import { cn } from "@/lib/utils";

// Mock data - replace with real data from API
const mockCourseData = {
  title: "Sejarah Romawi Kuno",
  estimation: "5 Jam",
  level: "Intermediate",
  progress: 35,
  completedChapters: 4,
  totalChapters: 12,
};

const mockChapters: ChapterItem[] = [
  {
    id: "1",
    title: "Pendahuluan Romawi Kuno",
    duration: "15 min",
    status: "completed",
  },
  {
    id: "2",
    title: "Republik Romawi",
    duration: "20 min",
    status: "active",
  },
  {
    id: "3",
    title: "Perkembangan Kekaisaran",
    duration: "18 min",
    status: "completed",
  },
  {
    id: "4",
    title: "Kejatuhan Romawi",
    duration: "22 min",
    status: "locked",
  },
  {
    id: "5",
    title: "Warisan Romawi",
    duration: "25 min",
    status: "locked",
  },
];

export default function CourseDashboardPage() {
  const router = useRouter();

  const handleChapterClick = (chapter: ChapterItem) => {
    if (chapter.status !== "locked") {
      router.push(`/dashboard/study-view/${chapter.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern">
      <div className="container mx-auto px-5 py-8 md:px-8 md:py-12 max-w-4xl">
        {/* Course Progress Header */}
        <div className="mb-8">
          <CourseProgress
            title={mockCourseData.title}
            estimation={mockCourseData.estimation}
            level={mockCourseData.level}
            progress={mockCourseData.progress}
            completedChapters={mockCourseData.completedChapters}
            totalChapters={mockCourseData.totalChapters}
          />
        </div>

        {/* Chapter List */}
        <div className="glass-sm border border-border/60 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Daftar Bab
          </h2>
          <div className="space-y-3">
            <ChapterList
              chapters={mockChapters}
              onChapterClick={handleChapterClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
