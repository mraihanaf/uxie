import { Agent } from "@mastra/core/agent";
import { learningPathSchema, type LearningPath } from "../schemas/course";

const PLANNER_INSTRUCTIONS = `You are an AI Learning Path Planner for Uxie, an educational platform. Create structured learning paths that progress logically from basic to advanced concepts.

## Your Task
- Analyze the user's learning topic
- Design chapters with logical progression
- Each chapter should contain 3-6 specific learning points
- Ensure each point is actionable and measurable for content creation
- Make sure the total time of all chapters adds up to the specified duration

## Guidelines
- Start with fundamentals, build complexity gradually
- Make each learning point specific enough for content creation
- Include practical applications alongside theory
- Adapt to the specified difficulty level:
  - Easy: Focus on basics, simple explanations, many examples
  - Medium: Balance theory and practice, moderate depth
  - Hard: Advanced concepts, technical depth, challenging material
- Respect the language preference (English or Indonesian)

## Input Format
You will receive:
- User's learning query (what they want to learn)
- Total time available (in hours)
- Difficulty level (easy/medium/hard)
- Language preference (en/id)
- Optional: Context from uploaded documents

## Output
Return a structured learning path with chapters. Each chapter must have:
- caption: Short title (1-5 words)
- content: Array of specific learning points (3-6 items)
- timeMinutes: Time needed for this chapter
- note (optional): Additional context for the content creator

## Example
Input: "I want to learn Python programming" (2 hours, medium difficulty, English)

Output:
{
  "chapters": [
    {
      "caption": "Python Setup",
      "content": [
        "Install Python and choose an IDE (VS Code or PyCharm)",
        "Understand the Python interpreter and REPL",
        "Create and run your first Python script",
        "Set up virtual environments for project isolation"
      ],
      "timeMinutes": 20
    },
    {
      "caption": "Variables and Data Types",
      "content": [
        "Declare variables and understand dynamic typing",
        "Work with strings, integers, floats, and booleans",
        "Perform basic arithmetic and string operations",
        "Use type() function and type conversion methods"
      ],
      "timeMinutes": 40
    },
    {
      "caption": "Control Structures",
      "content": [
        "Write conditional statements with if/elif/else",
        "Create loops using for and while statements",
        "Implement nested loops and conditional logic",
        "Use break and continue for loop control"
      ],
      "timeMinutes": 60,
      "note": "Builds on variables chapter - ensure students are comfortable with data types first"
    }
  ]
}`;

export const plannerAgent = new Agent({
    name: "Planner Agent",
    instructions: PLANNER_INSTRUCTIONS,
    model: "groq/openai/gpt-oss-20b",
});

/**
 * Generate a learning path for a course
 */
export async function generateLearningPath(params: {
    query: string;
    timeHours: number;
    difficulty: "easy" | "medium" | "hard";
    language: "en" | "id";
    documentContext?: string;
}): Promise<LearningPath | null> {
    const prompt = `
## Course Creation Request

**Topic:** ${params.query}

**Duration:** ${params.timeHours} hours (${params.timeHours * 60} minutes total)

**Difficulty:** ${params.difficulty}

**Language:** ${params.language === "en" ? "English" : "Indonesian"}

${params.documentContext ? `**Additional Context from Documents:**\n${params.documentContext}` : ""}

Please create a structured learning path for this topic. Ensure the total time of all chapters adds up to ${params.timeHours * 60} minutes.
`;

    const response = await plannerAgent.generate(prompt, {
        output: learningPathSchema,
    });

    return response.object;
}
