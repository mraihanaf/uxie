import { Agent } from "@mastra/core/agent";
import { z } from "zod";

// Multiple choice question schema - plain text
export const mcQuestionSchema = z.object({
    type: z.literal("multiple_choice"),
    question: z.string().describe("The question text"),
    answerA: z.string().describe("Answer option A"),
    answerB: z.string().describe("Answer option B"),
    answerC: z.string().describe("Answer option C"),
    answerD: z.string().describe("Answer option D"),
    correctAnswer: z
        .enum(["a", "b", "c", "d"])
        .describe("The letter of the correct answer"),
    explanation: z.string().describe("Why the correct answer is correct"),
});

export type MCQuestion = z.infer<typeof mcQuestionSchema>;

// Open text question schema - plain text
export const openTextQuestionSchema = z.object({
    type: z.literal("open_text"),
    question: z.string().describe("The question text"),
    correctAnswer: z.string().describe("The expected correct answer"),
    gradingCriteria: z
        .string()
        .optional()
        .describe("Criteria for grading the answer"),
});

export type OpenTextQuestion = z.infer<typeof openTextQuestionSchema>;

// Quiz schema
export const quizSchema = z.object({
    questions: z
        .array(z.union([mcQuestionSchema, openTextQuestionSchema]))
        .min(3)
        .max(15)
        .describe("Mix of multiple choice and open text questions"),
});

export type Quiz = z.infer<typeof quizSchema>;

const QUIZ_INSTRUCTIONS = `You are a quiz/examination agent for Uxie, an AI-powered learning platform. Your task is to create practice questions to test users on the chapter content.

## Your Task
Create practice questions based on the chapter content you receive. Generate 3-15 questions depending on the chapter length and time allocation.

## Question Types

### A) Multiple Choice Questions
Simple questions with 4 options where only one is correct.

Example:
{
  "type": "multiple_choice",
  "question": "Which planet is called the Red Planet?",
  "answerA": "Earth",
  "answerB": "Mars",
  "answerC": "Jupiter",
  "answerD": "Venus",
  "correctAnswer": "b",
  "explanation": "Mars is called the 'Red Planet' because of its reddish appearance due to iron oxide on its surface."
}

### B) Open Text Questions
Questions where the user writes short freeform text (1-3 sentences).

Example:
{
  "type": "open_text",
  "question": "Explain why photosynthesis is important for life on Earth.",
  "correctAnswer": "Photosynthesis converts sunlight into chemical energy, produces oxygen, and forms the base of most food chains.",
  "gradingCriteria": "Should mention: energy conversion, oxygen production, food chain foundation"
}

## Guidelines

### Question Quality
- **Prioritize understanding over memorization**
- Create questions with clear right/wrong answers, not subjective interpretations
- Mix the order of MC and OT questions naturally
- You can output only MC or only OT questions depending on the chapter content
- Include some longer, story-based questions for engagement
- Vary question difficulty within the quiz

### Difficulty Adaptation
- **Easy:** Straightforward questions, direct recall, clear options
- **Medium:** Application-based questions, requires understanding
- **Hard:** Analysis questions, complex scenarios, edge cases

### Question Distribution
- For a 20-minute chapter: 3-5 questions
- For a 40-minute chapter: 5-8 questions
- For a 60+ minute chapter: 8-15 questions

### Language
- Use the specified language throughout (English or Indonesian)
- Ensure questions are culturally appropriate

## Output Format
Return a JSON object with a "questions" array containing the question objects.
All questions should be plain text (no JSX, no code, no markdown formatting).
`;

export const quizAgent = new Agent({
    name: "Quiz Agent",
    instructions: QUIZ_INSTRUCTIONS,
    model: "groq/openai/gpt-oss-20b",
});

/**
 * Generate quiz questions for a chapter
 */
export async function generateQuiz(params: {
    chapterCaption: string;
    chapterContent: string;
    timeMinutes: number;
    userQuery: string;
    difficulty: "easy" | "medium" | "hard";
    language: "en" | "id";
}): Promise<Quiz | null> {
    // Determine number of questions based on time
    let questionCount = "3-5";
    if (params.timeMinutes >= 40 && params.timeMinutes < 60) {
        questionCount = "5-8";
    } else if (params.timeMinutes >= 60) {
        questionCount = "8-12";
    }

    const prompt = `
## Quiz Generation Request

**Original Course Topic:** ${params.userQuery}

**Chapter:** ${params.chapterCaption}

**Chapter Content Summary:**
${params.chapterContent.slice(0, 2000)}${params.chapterContent.length > 2000 ? "..." : ""}

**Time Allocated:** ${params.timeMinutes} minutes

**Difficulty Level:** ${params.difficulty}

**Language:** ${params.language === "en" ? "English" : "Indonesian"}

---

Create ${questionCount} questions based on this chapter content.
Mix multiple choice and open text questions.
All questions should be plain text - no JSX, no code formatting, no markdown.
`;

    try {
        const response = await quizAgent.generate(prompt, {
            output: quizSchema,
        });

        return response.object || null;
    } catch (error) {
        console.error("[Quiz] Generation error:", error);
        return null;
    }
}
