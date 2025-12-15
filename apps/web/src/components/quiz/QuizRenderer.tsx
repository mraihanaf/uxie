"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { MCQuestion, OpenTextQuestion, Question } from "@/types/course";

interface QuizResult {
  questionIndex: number;
  correct: boolean;
  points: number;
  userAnswer: string;
}

interface QuizRendererProps {
  questions: Question[];
  onComplete?: (
    results: QuizResult[],
    totalScore: number,
    maxScore: number,
  ) => void;
  onGradeOpenText?: (
    question: string,
    correctAnswer: string,
    userAnswer: string,
    gradingCriteria?: string,
  ) => Promise<{ points: number; feedback: string }>;
  className?: string;
}

export default function QuizRenderer({
  questions,
  onComplete,
  onGradeOpenText,
  className,
}: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  // Ensure all points are valid numbers to prevent NaN
  const totalPoints = results.reduce((sum, r) => {
    const points = typeof r.points === "number" ? r.points : 0;
    return sum + points;
  }, 0);
  const maxPoints = questions.length * 2;

  const handleMCSubmit = () => {
    if (
      !selectedAnswer ||
      !currentQuestion ||
      currentQuestion.type !== "multiple_choice"
    )
      return;

    const mcQuestion = currentQuestion as MCQuestion;
    const isCorrect = selectedAnswer === mcQuestion.correctAnswer;
    const result: QuizResult = {
      questionIndex: currentIndex,
      correct: isCorrect,
      points: isCorrect ? 2 : 0,
      userAnswer: selectedAnswer,
    };

    setResults([...results, result]);
    setFeedback(mcQuestion.explanation);
    setShowResult(true);
  };

  const handleOpenTextSubmit = async () => {
    if (
      !textAnswer.trim() ||
      !currentQuestion ||
      currentQuestion.type !== "open_text"
    )
      return;

    const otQuestion = currentQuestion as OpenTextQuestion;
    setGrading(true);

    try {
      if (onGradeOpenText) {
        const gradeResult = await onGradeOpenText(
          otQuestion.question,
          otQuestion.correctAnswer,
          textAnswer,
          otQuestion.gradingCriteria,
        );

        // Validate points - ensure it's a number between 0 and 2
        const points =
          typeof gradeResult.points === "number"
            ? Math.max(0, Math.min(2, Math.round(gradeResult.points)))
            : 0;

        const result: QuizResult = {
          questionIndex: currentIndex,
          correct: points === 2,
          points,
          userAnswer: textAnswer,
        };

        setResults([...results, result]);
        setFeedback(gradeResult.feedback || "No feedback provided.");
      } else {
        // Simple matching if no grader provided
        const isCorrect = textAnswer
          .toLowerCase()
          .includes(otQuestion.correctAnswer.toLowerCase());

        const result: QuizResult = {
          questionIndex: currentIndex,
          correct: isCorrect,
          points: isCorrect ? 2 : 0,
          userAnswer: textAnswer,
        };

        setResults([...results, result]);
        setFeedback(
          isCorrect
            ? "Correct!"
            : `The expected answer was: ${otQuestion.correctAnswer}`,
        );
      }
    } catch (error) {
      console.error("Grading error:", error);
      // Set a default result with 0 points on error to prevent NaN
      const result: QuizResult = {
        questionIndex: currentIndex,
        correct: false,
        points: 0,
        userAnswer: textAnswer,
      };
      setResults([...results, result]);
      setFeedback("Error grading answer. Please try again.");
    } finally {
      setGrading(false);
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalResults = [...results];
      // Ensure all points are valid numbers to prevent NaN
      const finalScore = finalResults.reduce((sum, r) => {
        const points = typeof r.points === "number" ? r.points : 0;
        return sum + points;
      }, 0);
      setQuizCompleted(true);
      onComplete?.(finalResults, finalScore, maxPoints);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setTextAnswer("");
      setShowResult(false);
      setFeedback(null);
    }
  };

  // Quiz completed screen
  if (quizCompleted) {
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    const passed = percentage >= 60;

    return (
      <Card className={cn("border-0 shadow-raised", className)}>
        <CardContent className="pt-8 text-center">
          <div
            className={cn(
              "size-20 rounded-full mx-auto mb-6 flex items-center justify-center",
              passed ? "bg-[var(--pastel-green)]" : "bg-[var(--pastel-yellow)]",
            )}
          >
            {passed ? (
              <CheckCircle className="size-10 text-[var(--accent-green)]" />
            ) : (
              <span className="text-3xl">📚</span>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {passed ? "Great job!" : "Keep learning!"}
          </h2>

          <p className="text-[var(--foreground-secondary)] mb-6">
            You scored {totalPoints} out of {maxPoints} points ({percentage}%)
          </p>

          <div className="max-w-xs mx-auto mb-8">
            <Progress
              value={percentage}
              variant={passed ? "green" : "default"}
              size="lg"
            />
          </div>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button onClick={() => window.location.reload()}>
              Retake Quiz
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Chapter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="lilac" size="lg">
            Question {currentIndex + 1} of {questions.length}
          </Badge>
          <Badge variant="outline">
            {currentQuestion.type === "multiple_choice"
              ? "Multiple Choice"
              : "Open Text"}
          </Badge>
        </div>
        <span className="text-sm font-medium text-[var(--foreground-secondary)]">
          {totalPoints} pts
        </span>
      </div>

      <Progress
        value={((currentIndex + 1) / questions.length) * 100}
        variant="lilac"
      />

      {/* Question Card */}
      <Card className="border-0 shadow-raised">
        <CardHeader>
          <CardTitle className="text-lg font-medium leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Answer Input */}
          {currentQuestion.type === "multiple_choice" ? (
            <div className="space-y-3">
              {(["a", "b", "c", "d"] as const).map((letter) => {
                const mcQuestion = currentQuestion as MCQuestion;
                const answerKey =
                  `answer${letter.toUpperCase()}` as keyof MCQuestion;
                const answer = mcQuestion[answerKey] as string;

                const isCorrectAnswer = mcQuestion.correctAnswer === letter;
                const isSelected = selectedAnswer === letter;

                return (
                  <button
                    key={letter}
                    onClick={() => !showResult && setSelectedAnswer(letter)}
                    disabled={showResult}
                    className={cn(
                      "w-full p-4 text-left rounded-xl border-2 transition-all duration-200",
                      showResult
                        ? isCorrectAnswer
                          ? "border-[var(--accent-green)] bg-[var(--pastel-green)]"
                          : isSelected
                            ? "border-red-400 bg-red-50"
                            : "border-border/50 bg-muted/30"
                        : isSelected
                          ? "border-[var(--accent-lilac)] bg-[var(--pastel-lilac)]"
                          : "border-border hover:border-[var(--accent-lilac)]/50 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "size-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                          showResult
                            ? isCorrectAnswer
                              ? "bg-[var(--accent-green)] text-white"
                              : isSelected
                                ? "bg-red-400 text-white"
                                : "bg-muted text-[var(--foreground-muted)]"
                            : isSelected
                              ? "bg-[var(--accent-lilac)] text-white"
                              : "bg-muted text-[var(--foreground-secondary)]",
                        )}
                      >
                        {letter.toUpperCase()}
                      </span>
                      <span className="pt-0.5">{answer}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={showResult || grading}
                placeholder="Type your answer here..."
                className="min-h-[150px]"
              />
            </div>
          )}

          {/* Feedback */}
          {showResult && feedback && (
            <div
              className={cn(
                "p-4 rounded-xl border-2",
                results[results.length - 1]?.correct
                  ? "bg-[var(--pastel-green)] border-[var(--accent-green)]/30"
                  : results[results.length - 1]?.points === 1
                    ? "bg-[var(--pastel-yellow)] border-[var(--accent-yellow)]/30"
                    : "bg-[var(--pastel-pink)] border-[var(--accent-pink)]/30",
              )}
            >
              <div className="flex items-start gap-3">
                {results[results.length - 1]?.correct ? (
                  <CheckCircle className="size-5 text-[var(--accent-green)] shrink-0 mt-0.5" />
                ) : results[results.length - 1]?.points === 1 ? (
                  <span className="text-lg">📝</span>
                ) : (
                  <XCircle className="size-5 text-[var(--accent-pink)] shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold mb-1">
                    {results[results.length - 1]?.correct
                      ? "Correct! (+2 pts)"
                      : results[results.length - 1]?.points === 1
                        ? "Partially correct (+1 pt)"
                        : "Not quite (0 pts)"}
                  </p>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {feedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4">
            {!showResult ? (
              <Button
                onClick={
                  currentQuestion.type === "multiple_choice"
                    ? handleMCSubmit
                    : handleOpenTextSubmit
                }
                disabled={
                  currentQuestion.type === "multiple_choice"
                    ? !selectedAnswer
                    : !textAnswer.trim() || grading
                }
              >
                {grading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Grading...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
