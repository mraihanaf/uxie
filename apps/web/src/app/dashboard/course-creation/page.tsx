"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { TextInput } from "@/components/input";
import { FileUpload } from "@/components/file-upload";
import { CardRadio, type CardRadioOption } from "@/components/card-radio";
import {
  SegmentedControl,
  type SegmentedControlOption,
} from "@/components/segmented-control";
import { PrimaryButton } from "@/components/button";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

const timelineOptions: CardRadioOption[] = [
  {
    value: "quick",
    title: "Penyegaran Cepat",
    duration: "2 Jam",
    description: "Cocok untuk review kilat",
    icon: <span className="text-4xl">⚡</span>,
  },
  {
    value: "standard",
    title: "Standar",
    duration: "5-10 Jam",
    description: "Pembelajaran mendalam dan komprehensif",
    icon: <span className="text-4xl">📖</span>,
  },
  {
    value: "deep-dive",
    title: "Deep Dive",
    duration: "25+ Jam",
    description: "Eksplorasi mendalam dengan detail lengkap",
    icon: <span className="text-4xl">🏆</span>,
  },
];

const difficultyOptions: SegmentedControlOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function CourseCreationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    topic: "",
    files: [] as File[],
    timeline: "",
    difficulty: "beginner",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Navigate to course dashboard
    router.push("/dashboard/course-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern">
      <div className="flex min-h-screen items-center justify-center px-5 py-8 md:px-8 md:py-12">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "glass-sm border border-border/60 rounded-xl shadow-lg",
            "w-full max-w-[600px] p-8 md:p-8",
          )}
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center">
            Buat Kursus Baru
          </h1>

          <div className="flex flex-col gap-6">
            {/* Input Topic */}
            <div>
              <TextInput
                label="Apa yang ingin kamu pelajari hari ini?"
                placeholder="Contoh: Sejarah Romawi Kuno..."
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                required
              />
            </div>

            {/* Upload Material */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Materi
              </label>
              <FileUpload
                acceptedFormats={["pdf", "docx", "jpg", "jpeg", "png", "txt"]}
                value={formData.files}
                onChange={(files) => setFormData({ ...formData, files })}
              />
            </div>

            {/* Timeline Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-4">
                Pilih Timeline Pembelajaran
              </label>
              <CardRadio
                options={timelineOptions}
                value={formData.timeline}
                onChange={(value) =>
                  setFormData({ ...formData, timeline: value })
                }
              />
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Tingkat Kesulitan
              </label>
              <SegmentedControl
                options={difficultyOptions}
                value={formData.difficulty}
                onChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
              />
            </div>

            {/* Submit Button */}
            <PrimaryButton
              type="submit"
              size="lg"
              className="w-full mt-2"
              disabled={
                isLoading || !formData.topic.trim() || !formData.timeline
              }
            >
              {isLoading ? (
                <>
                  <Spinner size="small" color="white" className="mr-2" />
                  Membuat Kursus...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Course
                </>
              )}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
