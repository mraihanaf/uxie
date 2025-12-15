// Course types matching the API schemas from IMPLEMENTATION.md

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

export interface ChapterPlan {
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
    chapter: ChapterPlan;
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

// UI-specific types
export interface CourseWithProgress {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    totalTimeHours: number | null;
    difficulty: "easy" | "medium" | "hard";
    language: "en" | "id";
    status: "creating" | "finished" | "failed";
    chaptersCount: number;
    completedChapters: number;
    progress: number; // 0-100
    createdAt: string;
}

export interface ChapterWithProgress {
    id: string;
    index: number;
    caption: string;
    summary: string | null;
    timeMinutes: number | null;
    completed: boolean;
    quizScore: number | null;
}
