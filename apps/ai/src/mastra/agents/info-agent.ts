import { Agent } from "@mastra/core/agent";
import { courseInfoSchema, type CourseInfo } from "../schemas/course";

const INFO_INSTRUCTIONS = `You are an AI assistant responsible for generating a concise title and a short description for a new course based on a user's learning request.

## Your Task
1. Analyze the user's primary course creation query
2. Generate a short, catchy, and relevant title for the course (1-5 words)
3. Generate a brief (1-2 sentences) overview description of what the course is about
4. Generate a search query for finding a relevant cover image

## Guidelines
- Make titles catchy and memorable
- Descriptions should be engaging and informative
- Image queries should be specific enough to find relevant visuals
- Adapt to the specified language (English or Indonesian)
- Consider the difficulty level in your descriptions

## Example
Input: "I want to learn about quantum physics, focusing on entanglement and quantum computing."

Output:
{
  "title": "Quantum Physics Unveiled",
  "description": "Explore the fundamentals of quantum physics, with a special focus on the principles of quantum entanglement and the basics of quantum computing.",
  "imageQuery": "quantum physics atoms visualization"
}`;

export const infoAgent = new Agent({
    name: "Info Agent",
    instructions: INFO_INSTRUCTIONS,
    model: "groq/openai/gpt-oss-20b",
});

/**
 * Generate course info (title, description, image query)
 */
export async function generateCourseInfo(params: {
    query: string;
    timeHours: number;
    difficulty: "easy" | "medium" | "hard";
    language: "en" | "id";
    documentSummary?: string;
}): Promise<CourseInfo | null> {
    const prompt = `
## Course Creation Request

**Topic:** ${params.query}

**Duration:** ${params.timeHours} hours

**Difficulty:** ${params.difficulty}

**Language:** ${params.language === "en" ? "English" : "Indonesian"}

${params.documentSummary ? `**Uploaded Documents Summary:**\n${params.documentSummary}` : ""}

Please generate a title, description, and image search query for this course.
`;

    const response = await infoAgent.generate(prompt, {
        output: courseInfoSchema,
    });

    return response.object;
}
