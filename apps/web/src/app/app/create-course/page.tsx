"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  Globe,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  createCourseRecord,
  updateCourseStatus,
} from "@/lib/api/supabase-data";
import {
  createCourse,
  waitForWorkflowCompletion,
} from "@/lib/api/mastra-client";
import type { CourseRequest } from "@/types/course";

type Step = "input" | "review" | "generating";

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [courseId, setCourseId] = useState<string | null>(null);

  // Form state
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("2");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [language, setLanguage] = useState<"en" | "id">("en");

  const handleNext = () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    setError(null);
    setStep("review");
  };

  const handleBack = () => {
    setStep("input");
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStep("generating");
    setProgress(5);
    setStatusMessage("Creating your course...");

    try {
      // Create course record in Supabase
      const course = await createCourseRecord({
        title: topic,
        totalTimeHours: parseFloat(duration),
        difficulty,
        language,
      });
      if (!course || !course.id) {
        throw new Error("Failed to create course record");
      }
      setCourseId(course.id);
      setProgress(10);
      setStatusMessage("Starting AI generation...");

      // Start the Mastra workflow with courseId for automatic saving
      const request: CourseRequest = {
        query: topic,
        timeHours: parseFloat(duration),
        difficulty,
        language,
      };

      const { runId } = await createCourse(request, course.id);
      setProgress(20);
      setStatusMessage("Generating course structure...");

      // Wait for workflow completion with progress updates
      await waitForWorkflowCompletion(runId, (status) => {
        setStatusMessage(status);
        // Increment progress gradually
        setProgress((prev) => Math.min(prev + 5, 90));
      });

      // Course is automatically saved by the workflow save step
      // No need to manually update status here
      setProgress(100);
      setStatusMessage("Course created successfully!");

      // Redirect to course page after a brief delay
      if (course?.id) {
        setTimeout(() => {
          router.push(`/app/courses/${course.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Course creation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create course. Please try again.",
      );

      // Update course status to failed if we have a course ID
      if (courseId) {
        await updateCourseStatus(
          courseId,
          "failed",
          err instanceof Error ? err.message : "Unknown error",
        );
      }

      setStep("review");
    } finally {
      setLoading(false);
    }
  };

  // Input Step
  if (step === "input") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/app"
            className="text-sm text-[var(--foreground-muted)] hover:text-foreground flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create a New Course</h1>
          <p className="text-[var(--foreground-secondary)]">
            Tell us what you want to learn and we&apos;ll create a personalized
            AI course for you.
          </p>
        </div>

        <Card className="border-0 shadow-raised">
          <CardContent className="pt-6 space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--accent-lilac)]" />
                What do you want to learn?
              </label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Introduction to Machine Learning, React Hooks deep dive, Calculus fundamentals..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-[var(--foreground-muted)]">
                Be as specific as you like - the AI will structure your course
                accordingly.
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="size-4 text-[var(--accent-blue)]" />
                Course Duration
              </label>
              <Select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <SelectOption value="0.5">Quick overview (30 min)</SelectOption>
                <SelectOption value="1">Short course (1 hour)</SelectOption>
                <SelectOption value="2">Standard course (2 hours)</SelectOption>
                <SelectOption value="5">In-depth course (5 hours)</SelectOption>
                <SelectOption value="10">
                  Comprehensive course (10 hours)
                </SelectOption>
                <SelectOption value="20">Deep dive (20 hours)</SelectOption>
                <SelectOption value="30">
                  Complete mastery (30 hours)
                </SelectOption>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="size-4 text-[var(--accent-pink)]" />
                Difficulty Level
              </label>
              <div className="flex gap-3">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      difficulty === level
                        ? level === "easy"
                          ? "border-[var(--accent-green)] bg-[var(--pastel-green)]"
                          : level === "medium"
                            ? "border-[var(--accent-yellow)] bg-[var(--pastel-yellow)]"
                            : "border-[var(--accent-pink)] bg-[var(--pastel-pink)]"
                        : "border-border hover:border-[var(--accent-lilac)]/50"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="size-4 text-[var(--accent-green)]" />
                Language
              </label>
              <div className="flex gap-3">
                {[
                  { value: "en", label: "English", flag: "🇺🇸" },
                  { value: "id", label: "Indonesian", flag: "🇮🇩" },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value as "en" | "id")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      language === lang.value
                        ? "border-[var(--accent-lilac)] bg-[var(--pastel-lilac)]"
                        : "border-border hover:border-[var(--accent-lilac)]/50"
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button onClick={handleNext} className="w-full gap-2">
              Review & Generate
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review Step
  if (step === "review") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="text-sm text-[var(--foreground-muted)] hover:text-foreground flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Edit
          </button>
          <h1 className="text-2xl font-bold mb-2">Review Your Course</h1>
          <p className="text-[var(--foreground-secondary)]">
            Confirm the details below before we generate your course.
          </p>
        </div>

        <Card className="border-0 shadow-raised mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Topic</p>
                <p className="font-semibold text-lg">{topic}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Duration
                </p>
                <p className="font-medium">{duration} hours</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Difficulty
                </p>
                <Badge
                  variant={
                    difficulty === "easy"
                      ? "green"
                      : difficulty === "medium"
                        ? "yellow"
                        : "pink"
                  }
                >
                  {difficulty}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Language
                </p>
                <p className="font-medium">
                  {language === "en" ? "🇺🇸 English" : "🇮🇩 Indonesian"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Edit Details
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Course
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Generating Step
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="mb-8">
        {progress < 100 ? (
          <div className="relative size-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[var(--pastel-lilac)] rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[var(--accent-lilac)] border-r-[var(--accent-lilac)] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="size-8 text-[var(--accent-lilac)]" />
            </div>
          </div>
        ) : (
          <div className="size-24 mx-auto mb-6 rounded-full bg-[var(--pastel-green)] flex items-center justify-center">
            <CheckCircle className="size-12 text-[var(--accent-green)]" />
          </div>
        )}

        <h2 className="text-xl font-bold mb-2">
          {progress < 100 ? "Creating Your Course" : "Course Created!"}
        </h2>
        <p className="text-[var(--foreground-secondary)] mb-6">
          {statusMessage}
        </p>

        <div className="max-w-xs mx-auto">
          <Progress
            value={progress}
            variant={progress < 100 ? "lilac" : "green"}
            size="lg"
          />
          <p className="text-sm text-[var(--foreground-muted)] mt-2">
            {progress}% complete
          </p>
        </div>
      </div>

      <div className="text-sm text-[var(--foreground-muted)]">
        <p>This may take a few minutes.</p>
        <p>
          Feel free to leave this page - we&apos;ll notify you when it&apos;s
          ready.
        </p>
      </div>
    </div>
  );
}
