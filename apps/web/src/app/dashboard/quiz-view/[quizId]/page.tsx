"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuizOption, type QuizOptionState } from "@/components/quiz-option";
import { AlertBanner } from "@/components/alert-banner";
import { StatsCard } from "@/components/card";
import { Badge } from "@/components/badge";
import { PrimaryButton, SecondaryButton } from "@/components/button";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    letter: string;
    text: string;
    isCorrect: boolean;
  }[];
}

// Mock data - replace with real data from API
const mockQuestions: QuizQuestion[] = [
  {
    id: "1",
    question: "Siapa pendiri kota Roma?",
    options: [
      { letter: "A", text: "Romulus dan Remus", isCorrect: true },
      { letter: "B", text: "Julius Caesar", isCorrect: false },
      { letter: "C", text: "Augustus", isCorrect: false },
      { letter: "D", text: "Titus Flavius", isCorrect: false },
    ],
  },
  {
    id: "2",
    question: "Kapan Republik Romawi didirikan?",
    options: [
      { letter: "A", text: "509 SM", isCorrect: true },
      { letter: "B", text: "27 SM", isCorrect: false },
      { letter: "C", text: "44 SM", isCorrect: false },
      { letter: "D", text: "476 M", isCorrect: false },
    ],
  },
  {
    id: "3",
    question: "Siapa kaisar pertama Romawi?",
    options: [
      { letter: "A", text: "Julius Caesar", isCorrect: false },
      { letter: "B", text: "Augustus", isCorrect: true },
      { letter: "C", text: "Nero", isCorrect: false },
      { letter: "D", text: "Trajan", isCorrect: false },
    ],
  },
];

const totalQuestions = mockQuestions.length;

export default function QuizViewPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.quizId as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(
    null,
  );
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [userAnswers, setUserAnswers] = React.useState<Record<string, string>>(
    {},
  );
  const [score, setScore] = React.useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = React.useState(600); // 10 minutes in seconds

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];
  const correctAnswer = currentQuestion.options.find((opt) => opt.isCorrect);

  React.useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (letter: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(letter);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      const newAnswers = {
        ...userAnswers,
        [currentQuestion.id]: selectedAnswer,
      };
      setUserAnswers(newAnswers);
      setIsSubmitted(true);

      // Calculate score
      let correctCount = 0;
      Object.entries(newAnswers).forEach(([questionId, answer]) => {
        const question = mockQuestions.find((q) => q.id === questionId);
        if (question) {
          const selectedOption = question.options.find(
            (opt) => opt.letter === answer,
          );
          if (selectedOption?.isCorrect) {
            correctCount++;
          }
        }
      });

      const currentScore = Math.round(
        (correctCount / Object.keys(newAnswers).length) * 100,
      );
      setScore(currentScore);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestionId = mockQuestions[currentQuestionIndex - 1].id;
      setSelectedAnswer(userAnswers[prevQuestionId] || null);
      setIsSubmitted(!!userAnswers[prevQuestionId]);
    }
  };

  const getOptionState = (
    letter: string,
    option: { letter: string; isCorrect: boolean },
  ): QuizOptionState => {
    if (!isSubmitted) {
      return selectedAnswer === letter ? "selected" : "default";
    }

    if (option.isCorrect) {
      return "correct";
    }

    if (letter === userAnswer && !option.isCorrect) {
      return "wrong";
    }

    return "default";
  };

  const isCorrect = isSubmitted && selectedAnswer === correctAnswer?.letter;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern">
      <div className="container mx-auto px-5 py-8 md:px-8 md:py-12 max-w-[700px]">
        {/* Header with Counter and Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Soal {currentQuestionIndex + 1} dari {totalQuestions}
            </h2>
          </div>
          <Badge variant="warning" size="default">
            {formatTime(timeRemaining)}
          </Badge>
        </div>

        {/* Question Card */}
        <div className="glass-sm border border-border/60 rounded-xl shadow-md mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option) => {
                const state = getOptionState(option.letter, option);
                return (
                  <QuizOption
                    key={option.letter}
                    letter={option.letter}
                    label={option.text}
                    state={state}
                    showResult={isSubmitted}
                    onClick={() => handleOptionSelect(option.letter)}
                    disabled={isSubmitted}
                  />
                );
              })}
            </div>

            {/* Submit/Result Section */}
            {isSubmitted && (
              <div className="space-y-4 mb-6">
                {/* Score Card (only show on first submission) */}
                {currentQuestionIndex === 0 && score !== null && (
                  <div className="flex justify-center mb-4">
                    <StatsCard
                      value={`${score}`}
                      label="/100"
                      variant={score >= 70 ? "success" : "error"}
                    />
                  </div>
                )}

                {/* Alert Banner */}
                <AlertBanner
                  variant={isCorrect ? "success" : "error"}
                  title={isCorrect ? "Jawabanmu tepat!" : "Kurang tepat!"}
                  message={
                    isCorrect
                      ? "Kamu memahami konsep ini dengan baik."
                      : `Pelajari lagi bagian tentang ${currentQuestion.question.toLowerCase()}. Jawaban yang benar adalah ${correctAnswer?.text}.`
                  }
                  dismissible={false}
                />

                {/* AI Tips */}
                <div className="glass-sm border border-accent/20 rounded-xl bg-accent/5 p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    💡 Saran AI Tutor
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {isCorrect
                      ? "Romulus adalah pendiri sekaligus raja pertama Kota Roma. Menurut legenda, dia dan saudara kembarnya Remus dibesarkan oleh serigala betina."
                      : "Pelajari lebih lanjut tentang sejarah Romawi Kuno untuk memahami konsep ini dengan lebih baik. Baca kembali materi yang telah disediakan."}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
              <SecondaryButton
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </SecondaryButton>

              {!isSubmitted ? (
                <PrimaryButton
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="flex items-center gap-2"
                >
                  Submit Answer
                  <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  onClick={handleNextQuestion}
                  disabled={isLastQuestion}
                  className="flex items-center gap-2"
                >
                  {isLastQuestion ? "Finish Quiz" : "Next Question"}
                  <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
