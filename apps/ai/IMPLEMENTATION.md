# Uxie AI Backend - Frontend Implementation Guide

This document provides complete instructions for implementing the frontend components that render AI-generated React/JSX content from the Uxie backend.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Required Dependencies](#required-dependencies)
3. [Core Components](#core-components)
4. [API Integration](#api-integration)
5. [Data Schemas](#data-schemas)
6. [Implementation Steps](#implementation-steps)
7. [Environment Variables](#environment-variables)
8. [Supabase Schema](#supabase-schema)
9. [JSX Validation & Retry System](#jsx-validation--retry-system)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌───────────────┐  ┌─────────────────┐    │
│  │AiCodeWrapper│  │ QuizRenderer  │  │  ChapterChat    │    │
│  │(renders JSX)│  │ (plain text)  │  │   (AI chat)     │    │
│  └──────┬──────┘  └───────┬───────┘  └───────┬─────────┘    │
│         │                 │                   │              │
│         ▼                 ▼                   ▼              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       string-to-react-component library               │   │
│  │       (converts JSX strings to React components)      │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                     Mastra AI Backend                        │
├─────────────────────────────────────────────────────────────┤
│  Agents (Groq):                                              │
│  • Planner Agent → Learning path structure                   │
│  • Info Agent → Course title, description                    │
│  • Explainer Agent → JSX chapter content + ESLint validation │
│  • Quiz Agent → Plain text quiz questions                    │
│  • Grader Agent → Answer grading                             │
│  • Chat Agent → Chapter Q&A                                  │
│                                                              │
│  JSX Validation:                                             │
│  • ESLint programmatic API (no subprocess)                   │
│  • eslint-plugin-react + eslint-plugin-react-hooks           │
│  • 5-iteration retry loop with error feedback                │
├─────────────────────────────────────────────────────────────┤
│                        Supabase                              │
│  • PostgreSQL + pgvector for RAG                             │
│  • Auth                                                      │
│  • Realtime for progress updates                             │
│  • Storage for documents/images                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Required Dependencies

Install these packages in your Next.js frontend:

```bash
# Core rendering library (CRITICAL)
pnpm add string-to-react-component

# Visualization libraries (must match backend expectations)
pnpm add recharts                    # Charts
pnpm add react-latex-next katex      # LaTeX math
pnpm add react-plotly.js plotly.js   # 3D plots
pnpm add react-syntax-highlighter    # Code highlighting
pnpm add @xyflow/react               # Flow diagrams
pnpm add motion                      # Animations (Framer Motion)

# Error handling
pnpm add react-error-boundary

# Supabase
pnpm add @supabase/supabase-js
```

### package.json dependencies

```json
{
  "dependencies": {
    "string-to-react-component": "^1.2.0",
    "recharts": "^2.12.0",
    "react-latex-next": "^3.0.0",
    "katex": "^0.16.9",
    "react-plotly.js": "^2.6.0",
    "plotly.js": "^2.29.0",
    "react-syntax-highlighter": "^15.5.0",
    "@xyflow/react": "^12.0.0",
    "motion": "^11.0.0",
    "react-error-boundary": "^4.0.12",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

---

## Core Components

### 1. AiCodeWrapper - The Core Renderer

This is the most important component. It renders AI-generated JSX strings as React components.

```tsx
// components/ai/AiCodeWrapper.tsx
"use client";

import React, { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Lazy load the string-to-react-component for better performance
const StringToReactComponent = lazy(() => import("string-to-react-component"));

// Import all visualization libraries
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import * as Recharts from "recharts";
import * as RF from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "motion/react";

// Lazy load Plotly (heavy library)
const Plot = lazy(() => import("react-plotly.js"));

// Custom ReactFlow wrapper with defaults
const CustomReactFlow: React.FC<React.ComponentProps<typeof RF.ReactFlow>> = (
  props,
) => {
  return (
    <RF.ReactFlow fitView attributionPosition="bottom-left" {...props}>
      {props.children}
    </RF.ReactFlow>
  );
};

// Modified RF object with custom defaults
const ModifiedRF = {
  ...RF,
  ReactFlow: CustomReactFlow,
};

// Paper background wrapper
const PaperBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen w-full bg-[#fdfdfd] bg-opacity-90 bg-[linear-gradient(#f9f9f9_1px,transparent_1px),linear-gradient(90deg,#f9f9f9_1px,transparent_1px)] bg-[size:20px_20px] text-gray-800">
      {children}
    </div>
  );
};

// Error fallback component
const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="p-6 border-2 border-red-400 rounded-lg bg-red-50">
    <h3 className="text-lg font-bold text-red-700 mb-2">❌ Rendering Error</h3>
    <p className="text-red-600 mb-2">{error.message}</p>
    <details className="text-sm text-gray-600 mb-4">
      <summary className="cursor-pointer">Error Details</summary>
      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
        {error.stack}
      </pre>
    </details>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Try Again
    </button>
  </div>
);

// Loading component
const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
    <div className="relative w-16 h-16 mb-6">
      <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
      <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-500 rounded-full animate-spin" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">
      Loading Content...
    </h3>
    <p className="text-gray-500 text-center">
      Preparing interactive components
    </p>
  </div>
);

// Props interface
interface AiCodeWrapperProps {
  children: string; // The JSX code string
  showBackground?: boolean;
}

// The main component
export default function AiCodeWrapper({
  children,
  showBackground = true,
}: AiCodeWrapperProps) {
  // Plugins available to the AI-generated code
  const plugins =
    "Latex, Recharts, Plot, SyntaxHighlighter, dark, RF, motion, React";

  // Wrap the AI code with prop destructuring
  const header = `(props) => { const {${plugins}} = props;`;
  const fullReactComponent = `${header}${children}`;

  // Data object passed to the component
  const pluginData = {
    Latex,
    Recharts,
    Plot,
    SyntaxHighlighter,
    dark,
    RF: ModifiedRF,
    motion,
    React,
  };

  const content = (
    <Suspense fallback={<Loader />}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          console.error("AI Code Render Error:", error, errorInfo);
        }}
      >
        <div className="ai-content-wrapper">
          <StringToReactComponent data={pluginData}>
            {fullReactComponent}
          </StringToReactComponent>
        </div>
      </ErrorBoundary>
    </Suspense>
  );

  if (showBackground) {
    return <PaperBackground>{content}</PaperBackground>;
  }

  return content;
}
```

### 2. Quiz Component (Plain Text Questions)

Quiz questions are plain text (not JSX). This simplifies rendering and grading.

```tsx
// components/quiz/QuizRenderer.tsx
"use client";

import React, { useState } from "react";

interface MCQuestion {
  type: "multiple_choice";
  question: string; // Plain text
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: "a" | "b" | "c" | "d";
  explanation: string;
}

interface OpenTextQuestion {
  type: "open_text";
  question: string; // Plain text
  correctAnswer: string;
  gradingCriteria?: string;
}

type Question = MCQuestion | OpenTextQuestion;

interface QuizRendererProps {
  questions: Question[];
  onComplete?: (results: QuizResult[]) => void;
  onGradeOpenText?: (
    question: string,
    correctAnswer: string,
    userAnswer: string,
  ) => Promise<{ points: number; feedback: string }>;
}

interface QuizResult {
  questionIndex: number;
  correct: boolean;
  points: number;
  userAnswer: string;
}

export default function QuizRenderer({
  questions,
  onComplete,
  onGradeOpenText,
}: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleMCSubmit = () => {
    if (!selectedAnswer || currentQuestion.type !== "multiple_choice") return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const result: QuizResult = {
      questionIndex: currentIndex,
      correct: isCorrect,
      points: isCorrect ? 2 : 0,
      userAnswer: selectedAnswer,
    };

    setResults([...results, result]);
    setFeedback(currentQuestion.explanation);
    setShowResult(true);
  };

  const handleOpenTextSubmit = async () => {
    if (!textAnswer.trim() || currentQuestion.type !== "open_text") return;

    setGrading(true);

    try {
      if (onGradeOpenText) {
        // onGradeOpenText is a wrapper that provides course context
        const gradeResult = await onGradeOpenText(
          currentQuestion.question,
          currentQuestion.correctAnswer,
          textAnswer,
        );

        const result: QuizResult = {
          questionIndex: currentIndex,
          correct: gradeResult.points === 2,
          points: gradeResult.points,
          userAnswer: textAnswer,
        };

        setResults([...results, result]);
        setFeedback(gradeResult.feedback);
      } else {
        // Simple matching if no grader provided
        const isCorrect = textAnswer
          .toLowerCase()
          .includes(currentQuestion.correctAnswer.toLowerCase());

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
            : `The expected answer was: ${currentQuestion.correctAnswer}`,
        );
      }
    } catch (error) {
      setFeedback("Error grading answer. Please try again.");
    } finally {
      setGrading(false);
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete?.(results);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setTextAnswer("");
      setShowResult(false);
      setFeedback(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{results.reduce((sum, r) => sum + r.points, 0)} points</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question - Plain text */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <p className="text-lg text-gray-800">{currentQuestion.question}</p>
      </div>

      {/* Answer Input */}
      {currentQuestion.type === "multiple_choice" ? (
        <div className="space-y-3 mb-6">
          {(["a", "b", "c", "d"] as const).map((letter) => {
            const answerKey =
              `answer${letter.toUpperCase()}` as keyof MCQuestion;
            const answer = (currentQuestion as MCQuestion)[answerKey] as string;

            return (
              <button
                key={letter}
                onClick={() => !showResult && setSelectedAnswer(letter)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showResult
                    ? letter === (currentQuestion as MCQuestion).correctAnswer
                      ? "border-green-500 bg-green-50"
                      : selectedAnswer === letter
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    : selectedAnswer === letter
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className="font-bold mr-3">{letter.toUpperCase()}.</span>
                {answer}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mb-6">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={showResult || grading}
            placeholder="Type your answer here..."
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none min-h-[120px]"
          />
        </div>
      )}

      {/* Feedback */}
      {showResult && feedback && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            results[results.length - 1]?.correct
              ? "bg-green-50 border-2 border-green-200"
              : "bg-amber-50 border-2 border-amber-200"
          }`}
        >
          <p className="font-medium">
            {results[results.length - 1]?.correct
              ? "✅ Correct!"
              : "❌ Not quite"}
          </p>
          <p className="mt-2 text-gray-700">{feedback}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        {!showResult ? (
          <button
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
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {grading ? "Grading..." : "Submit Answer"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {isLastQuestion ? "Finish Quiz" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}
```

### 3. Chat Component

```tsx
// components/ai/ChapterChat.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChapterChatProps {
  courseId: string;
  chapterId: string;
  chapterContent: string;
  chapterCaption: string;
  onSendMessage: (message: string) => Promise<string>;
}

export default function ChapterChat({
  courseId,
  chapterId,
  chapterCaption,
  onSendMessage,
}: ChapterChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await onSendMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50">
        <h3 className="font-semibold text-blue-800">
          💬 Chat about: {chapterCaption}
        </h3>
        <p className="text-sm text-blue-600">
          Ask questions about this chapter
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>👋 Hi! I'm here to help you understand this chapter.</p>
            <p className="text-sm mt-2">Ask me anything!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.role === "assistant" ? (
                <ReactMarkdown className="prose prose-sm">
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## API Integration

### API Client Setup

```tsx
// lib/api/mastra-client.ts
const MASTRA_API_URL =
  process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111";

export async function generateAgent<T>(
  agentName: string,
  prompt: string,
  options?: { output?: any },
): Promise<T> {
  const response = await fetch(
    `${MASTRA_API_URL}/api/agents/${agentName}/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        ...(options?.output && { output: options.output }),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Agent error: ${response.statusText}`);
  }

  return response.json();
}

export async function createCourse(
  request: CourseRequest,
): Promise<FullCourse> {
  const response = await fetch(
    `${MASTRA_API_URL}/api/workflows/courseCreationWorkflow/start`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request }),
    },
  );

  if (!response.ok) {
    throw new Error(`Workflow error: ${response.statusText}`);
  }

  return response.json();
}

// Option 1: Direct backend function call (if using server-side API route)
// The backend gradeAnswer function fetches course metadata using courseId
export async function gradeAnswer(params: {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  gradingCriteria?: string;
  courseId: string;
}): Promise<{ points: number; feedback: string }> {
  // Call your backend API route that wraps the gradeAnswer function
  // Example: POST /api/grade-answer
  const response = await fetch(`${MASTRA_API_URL}/api/grade-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: params.question,
      correctAnswer: params.correctAnswer,
      userAnswer: params.userAnswer,
      gradingCriteria: params.gradingCriteria,
      courseId: params.courseId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grading error: ${response.statusText}`);
  }

  return response.json();
}

// Example: Wrapper function to use gradeAnswer with QuizRenderer
// The QuizRenderer's onGradeOpenText callback only needs courseId
export function createGradeAnswerWrapper(courseId: string) {
  return async (
    question: string,
    correctAnswer: string,
    userAnswer: string,
    gradingCriteria?: string,
  ): Promise<{ points: number; feedback: string }> => {
    return gradeAnswer({
      question,
      correctAnswer,
      userAnswer,
      gradingCriteria,
      courseId, // Backend will fetch course metadata (title, description, language, difficulty) from database
    });
  };
}

// Usage in a component:
// const gradeOpenText = createGradeAnswerWrapper(course.id);
//
// <QuizRenderer
//   questions={chapter.quiz.questions}
//   onGradeOpenText={gradeOpenText}
// />

export async function chatWithAgent(params: {
  message: string;
  courseId: string;
  chapterId: string;
  chapterContent: string;
}): Promise<{ message: string }> {
  const response = await fetch(
    `${MASTRA_API_URL}/api/agents/chatAgent/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: params.message }],
        threadId: `chat-${params.courseId}-${params.chapterId}`,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Chat error: ${response.statusText}`);
  }

  return response.json();
}
```

---

## Data Schemas

### TypeScript Types

```tsx
// types/course.ts

export interface CourseRequest {
  query: string;
  timeHours: number;
  difficulty: "easy" | "medium" | "hard";
  language: "en" | "id";
  documentIds?: string[];
  imageIds?: string[];
}

export interface CourseInfo {
  title: string;
  description: string;
  imageQuery: string;
}

export interface Chapter {
  caption: string;
  content: string[]; // Learning points
  timeMinutes: number;
  note?: string;
}

export interface ChapterContent {
  jsxCode: string; // The JSX component code
  keyTakeaways: string[];
}

export interface MCQuestion {
  type: "multiple_choice";
  question: string; // Plain text
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: "a" | "b" | "c" | "d";
  explanation: string;
}

export interface OpenTextQuestion {
  type: "open_text";
  question: string; // Plain text
  correctAnswer: string;
  gradingCriteria?: string;
}

export type Question = MCQuestion | OpenTextQuestion;

export interface Quiz {
  questions: Question[];
}

export interface FullChapter {
  chapter: Chapter;
  content: ChapterContent;
  quiz: Quiz;
  imageUrl?: string;
}

export interface FullCourse {
  info: CourseInfo;
  chapters: FullChapter[];
}

export interface Grading {
  points: number; // 0, 1, or 2
  feedback: string;
}
```

---

## Supabase Schema

### Database Tables

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (handled by Supabase Auth, extend if needed)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  total_time_hours DECIMAL(4,2),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT CHECK (language IN ('en', 'id')),
  status TEXT DEFAULT 'creating' CHECK (status IN ('creating', 'finished', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE public.chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  index INTEGER NOT NULL,
  caption TEXT NOT NULL,
  summary TEXT,
  jsx_content TEXT NOT NULL, -- The JSX code
  key_takeaways TEXT[], -- Array of key points
  time_minutes INTEGER,
  image_url TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'open_text')),
  question TEXT NOT NULL, -- Plain text question
  answer_a TEXT,
  answer_b TEXT,
  answer_c TEXT,
  answer_d TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  grading_criteria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress table
CREATE TABLE public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER,
  quiz_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Document embeddings for RAG
CREATE TABLE public.document_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON public.document_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RPC function for semantic search
CREATE OR REPLACE FUNCTION search_documents(
  p_course_id UUID,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 5,
  p_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  content_id TEXT,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.content_id,
    de.content,
    1 - (de.embedding <=> p_query_embedding) as similarity,
    de.metadata
  FROM public.document_embeddings de
  WHERE de.course_id = p_course_id
    AND 1 - (de.embedding <=> p_query_embedding) > p_threshold
  ORDER BY de.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$;

-- Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own courses" ON public.courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own courses" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view chapters of their courses" ON public.chapters
  FOR SELECT USING (
    course_id IN (SELECT id FROM public.courses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view questions of their courses" ON public.questions
  FOR SELECT USING (
    chapter_id IN (
      SELECT c.id FROM public.chapters c
      JOIN public.courses co ON c.course_id = co.id
      WHERE co.user_id = auth.uid()
    )
  );
```

---

## Environment Variables

### Backend (.env)

```bash
# Groq AI
GROQ_API_KEY=your_groq_api_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Unsplash (for cover images)
UNSPLASH_ACCESS_KEY=your_unsplash_key

# Database
DATABASE_URL=file:../mastra.db
```

### Frontend (.env.local)

```bash
# Mastra API
NEXT_PUBLIC_MASTRA_API_URL=http://localhost:4111

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_PUBLISHABLE_DEFAULT_KEY
```

---

## Implementation Steps

### Phase 1: Setup (Day 1)

1. Install all required dependencies
2. Set up environment variables
3. Create Supabase tables and functions
4. Copy the component files

### Phase 2: Core Components (Day 2-3)

1. Implement `AiCodeWrapper.tsx`
2. Create `PaperBackground.tsx`
3. Set up error boundaries
4. Test with sample JSX content

### Phase 3: Quiz & Chat (Day 4-5)

1. Implement `QuizRenderer.tsx`
2. Implement `ChapterChat.tsx`
3. Connect to Mastra API for grading
4. Test quiz flow end-to-end

### Phase 4: Pages (Day 6-7)

1. Create course creation flow
2. Implement course dashboard
3. Create chapter view page
4. Add progress tracking

### Phase 5: Polish (Day 8-10)

1. Add loading states
2. Implement error handling
3. Add progress persistence
4. Mobile responsiveness
5. Performance optimization

---

## Testing

### Test JSX Rendering

```tsx
// Test component to verify AiCodeWrapper works
const testJsxCode = `
() => {
  const [count, setCount] = React.useState(0);
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Test Component</h1>
      <p className="mb-4">Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Increment
      </button>
      <div className="mt-8">
        <Latex>{"$E = mc^2$"}</Latex>
      </div>
    </div>
  );
}
`;

// Usage
<AiCodeWrapper>{testJsxCode}</AiCodeWrapper>;
```

---

## Troubleshooting

### Common Issues

1. **"React is not defined"**: Ensure React is passed in the plugin data object
2. **Recharts not rendering**: Make sure to use `Recharts.LineChart` not `LineChart`
3. **LaTeX not displaying**: Check that katex CSS is imported
4. **ReactFlow empty**: Ensure container has explicit height

### Security Note

The `string-to-react-component` library evaluates JavaScript code at runtime. This is necessary for rendering AI-generated components but requires:

1. Always validate JSX on the backend before storing
2. Use Content Security Policy headers
3. Sanitize any user input that might be included in prompts

---

## JSX Validation & Retry System

The backend uses **ESLint programmatic API** to validate AI-generated JSX code, following implementation pattern.

### Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Explainer Agent                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Generate JSX code                                            │
│  2. Extract React component from response                        │
│  3. Validate with ESLint (React + Hooks plugins)                │
│  4. If errors → Retry with error feedback (up to 5 times)       │
│  5. If valid → Return JSX code                                   │
│  6. If all retries fail → Return fallback component              │
└─────────────────────────────────────────────────────────────────┘
```

### ESLint Configuration

The validator uses these ESLint plugins and rules:

```typescript
// Fatal errors (will crash component)
'no-undef': 'error',           // Undefined variables
'no-dupe-keys': 'error',       // Duplicate object keys
'react/jsx-key': 'error',      // Missing keys in lists
'react/jsx-no-undef': 'error', // Undefined JSX components
'react-hooks/rules-of-hooks': 'error', // Hook violations

// Warnings (won't crash but bad practice)
'no-unused-vars': 'warn',
'react-hooks/exhaustive-deps': 'warn',
```

### Retry Loop (5 Iterations)

When validation fails, the agent receives detailed error feedback:

```
You were prompted before, but the code that you output did not pass
the syntax validation check.

Your previous code:
() => { ... }

Your code generated the following errors:
[
  { "message": "'undefined_var' is not defined", "line": 5 },
  { "message": "React Hook useEffect has a missing dependency", "line": 12 }
]

Please try again and rewrite your code from scratch...
```

### Available Globals in Validation

The following are pre-defined as available globals (won't trigger `no-undef`):

```typescript
// React
React;

// Visualization plugins (passed via props)
(Recharts, Latex, Plot, SyntaxHighlighter, dark, RF, motion);

// Browser globals
(window, document, console);
```

### Fallback Component

If all 5 retry attempts fail, a basic fallback component is returned:

```jsx
() => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1>Chapter Title</h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400">
        <p>We encountered an issue generating interactive content.</p>
      </div>
      <ul>
        <li>Learning point 1</li>
        <li>Learning point 2</li>
      </ul>
    </div>
  );
};
```

---

## Support

For issues with:

- **AI Agent behavior**: Check the agent prompts in `/src/mastra/agents/`
- **JSX validation**: See `/src/mastra/tools/jsx-validator.ts`
- **ESLint rules**: Modify `createEslintInstance()` in jsx-validator.ts
- **Retry behavior**: See `generateChapterContent()` in explainer-agent.ts
- **Plugin documentation**: See `/src/mastra/agents/explainer-agent/plugin-docs.ts`
