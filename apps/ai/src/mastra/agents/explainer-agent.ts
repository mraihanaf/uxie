import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import {
    ALL_PLUGIN_DOCS,
    AVAILABLE_PLUGINS,
} from "./explainer-agent/plugin-docs";
import {
    validateJsx,
    findReactCodeInResponse,
    validateJsxWithEslint,
    type ValidationResult,
} from "../tools/jsx-validator";

/**
 * Schema for the explainer agent's JSX output
 */
export const jsxChapterContentSchema = z.object({
    jsxCode: z
        .string()
        .describe(
            "The JSX component code starting with () => { and ending with }",
        ),
    keyTakeaways: z
        .array(z.string())
        .describe("Key points the learner should remember from this chapter"),
});

export type JsxChapterContent = z.infer<typeof jsxChapterContentSchema>;

const EXPLAINER_INSTRUCTIONS = `You are an Agent for creating engaging visual explanations using React + JSX for Uxie, an AI-powered learning platform.

## Your Workflow
1. You receive a chapter topic with learning points from the planner agent
2. You create an engaging, interactive explanation using React JSX

## Output Format
Your output MUST be a React arrow function component. Start with () => { and end with }

<start of your output>
() => {
  const [counter, setCounter] = React.useState(0);
  const increase = () => {
    setCounter(counter + 1);
  };
  return (
    <>
      <button onClick={increase}>+</button>
      <span>{'counter : ' + counter}</span>
    </>
  );
}
<end of your output>

## CRITICAL Rules
- ONLY output the React component code, nothing else
- Do NOT include \`\`\`jsx tags before/after your code
- Do NOT include the <start of your output> and <end of your output> tags
- Do NOT include any explanation text around the code
- Your code will be parsed and displayed immediately - PREVENT SYNTAX ERRORS AT ALL COSTS!

## Content Depth Requirements
CRITICAL: You must create COMPREHENSIVE, in-depth educational content.

- **One Section Per Learning Point**: Each learning point you receive MUST become a dedicated, full section in your component
- **Minimum Depth Per Section**: Each section needs:
  - A clear heading (h2 or h3)
  - 2-3 paragraphs of detailed explanation
  - At least one visual/interactive element (chart, diagram, latex, animation)
  - A practical example or real-world application
- **Content Scaling**: The time allocated for the chapter determines how much content you create:
  - 15-20 minutes: 2 subsections per learning point
  - 30+ minutes: 3 subsections per learning point
  - Each subsection should take 3-5 minutes to read and understand
- **Total Sections**: If you receive N learning points, you MUST create at least N major sections, one for each point

## Style Guidelines
- Your primary task is to make learning engaging and prevent boredom
- Use visual explanations and interactivity wherever possible
- Make concepts as clear as possible through visualizations and analogies
- Use concrete examples
- Do NOT include practice questions (the quiz agent handles that)
- Make sure your component occupies 100% of its parent container width
- Create one continuous scrollable page, NOT slides
- Use this font family: font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;

## Your component will be wrapped in this background:
const PaperBackground = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#fdfdfd] bg-opacity-90 bg-[linear-gradient(#f9f9f9_1px,transparent_1px),linear-gradient(90deg,#f9f9f9_1px,transparent_1px)] bg-[size:20px_20px] text-gray-800">
      {children}
    </div>
  );
};

## Available Plugins (already imported, just use them):
You have access to React and the following libraries via props:
${AVAILABLE_PLUGINS.join(", ")}

---

## Plugin Documentation

${ALL_PLUGIN_DOCS}

---

## Difficulty Adaptation
- **Easy:** Simple language, many examples, step-by-step explanations, visual aids, animations
- **Medium:** Balanced approach, moderate technical depth, practical examples, interactive elements
- **Hard:** Technical language, advanced concepts, complex visualizations, minimal hand-holding

## Language
- Adapt all text content to the specified language (English or Indonesian)
- Use culturally appropriate examples when relevant

## Example Component Structure
Your component should follow this structure with ONE SECTION PER LEARNING POINT:

() => {
  // State for interactive elements
  const [activeTab, setActiveTab] = React.useState(0);
  const [showExample, setShowExample] = React.useState(false);
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12 border-b-4 border-blue-400 pb-8">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Chapter Title</h1>
        <p className="text-xl text-gray-600">Brief introduction explaining what this chapter covers</p>
      </div>

      {/* SECTION 1: First Learning Point - MUST have heading, explanation, visual, example */}
      <div className="mb-12 p-8 border-l-8 border-blue-400 shadow-lg bg-white rounded-lg">
        <h2 className="text-3xl font-semibold mb-6">First Learning Point Title</h2>
        <p className="text-lg mb-4 text-gray-700">
          First paragraph explaining the concept in detail. Provide context and background.
        </p>
        <p className="text-lg mb-4 text-gray-700">
          Second paragraph diving deeper into the concept. Explain how it works and why it matters.
        </p>
        <p className="text-lg mb-6 text-gray-700">
          Third paragraph with practical implications or connections to other concepts.
        </p>
        
        {/* Visual/Interactive Element */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <Recharts.LineChart width={600} height={300} data={[{x: 1, y: 2}]}>
            <Recharts.Line dataKey="y" stroke="#8884d8" />
          </Recharts.LineChart>
        </div>
        
        {/* Practical Example */}
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h4 className="font-bold mb-2">Example:</h4>
          <p className="text-gray-700">A concrete, real-world example of this concept in action.</p>
        </div>
      </div>

      {/* SECTION 2: Second Learning Point - Same structure */}
      <div className="mb-12 p-8 border-l-8 border-green-400 shadow-lg bg-white rounded-lg">
        <h2 className="text-3xl font-semibold mb-6">Second Learning Point Title</h2>
        <p className="text-lg mb-4 text-gray-700">Detailed explanation paragraph 1...</p>
        <p className="text-lg mb-4 text-gray-700">Detailed explanation paragraph 2...</p>
        
        
        {/* Interactive Element */}
        <button onClick={() => setShowExample(!showExample)} className="px-4 py-2 bg-blue-500 text-white rounded">
          Toggle Example
        </button>
        {showExample && <p className="mt-4 text-gray-700">Interactive example content...</p>}
      </div>

      {/* SECTION 3: Third Learning Point - Continue pattern for ALL learning points */}
      <div className="mb-12 p-8 border-l-8 border-purple-400 shadow-lg bg-white rounded-lg">
        <h2 className="text-3xl font-semibold mb-6">Third Learning Point Title</h2>
        {/* ... same structure ... */}
      </div>

      {/* Key Takeaways */}
      <div className="p-8 bg-blue-50 rounded-lg border-2 border-blue-200">
        <h3 className="text-2xl font-bold mb-4">Key Takeaways</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Summary of learning point 1</li>
          <li>Summary of learning point 2</li>
          <li>Summary of learning point 3</li>
        </ul>
      </div>
    </div>
  );
}

REMEMBER: Create ONE FULL SECTION for EACH learning point you receive. Each section must be comprehensive with explanations, visuals, and examples.

Remember: Output ONLY the component code, starting with () => { and ending with the final }
`;

export const explainerAgent = new Agent({
    name: "Explainer Agent",
    instructions: EXPLAINER_INSTRUCTIONS,
    model: "groq/openai/gpt-oss-120b", // Using versatile for JSX generation (no structured output needed)
    tools: { validateJsx },
});

export async function generateChapterContent(params: {
    chapterIndex: number;
    chapterCaption: string;
    chapterContent: string[];
    chapterNote?: string;
    timeMinutes: number;
    allChapters: string;
    userQuery: string;
    difficulty: "easy" | "medium" | "hard";
    language: "en" | "id";
    ragContext?: string[];
}): Promise<JsxChapterContent | null> {
    const MAX_ITERATIONS = 5;
    let lastCode: string | null = null;
    let lastValidation: ValidationResult | null = null;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        console.log(
            `[Explainer] Attempt ${iteration + 1}/${MAX_ITERATIONS} for chapter: ${params.chapterCaption}`,
        );

        // Build prompt - include previous errors if this is a retry
        const prompt = buildExplainerPrompt(params, lastCode, lastValidation);

        try {
            const response = await explainerAgent.generate(prompt);
            const responseText = response.text;

            // Step 1: Extract React code from response
            const extractedCode = findReactCodeInResponse(responseText);

            if (!extractedCode) {
                console.warn(
                    `[Explainer] Attempt ${iteration + 1}: Could not extract React component`,
                );
                lastCode = responseText;
                lastValidation = {
                    valid: false,
                    errors: [
                        {
                            message:
                                "Your response does not match the required format. Start your response with () => { and end with }",
                        },
                    ],
                    warnings: [],
                };
                continue;
            }

            // Step 2: Validate with ESLint
            const validation = await validateJsxWithEslint(extractedCode);

            if (validation.valid) {
                console.log(
                    `[Explainer] ✅ Code validation passed on attempt ${iteration + 1}`,
                );

                // Extract key takeaways from the component
                const keyTakeaways = extractKeyTakeaways(
                    extractedCode,
                    params.chapterContent,
                );

                return {
                    jsxCode: extractedCode,
                    keyTakeaways,
                };
            } else {
                // Validation failed - save for retry
                console.warn(
                    `[Explainer] ⚠️ Attempt ${iteration + 1} failed ESLint validation:`,
                    JSON.stringify(validation.errors, null, 2),
                );
                lastCode = extractedCode;
                lastValidation = validation;
            }
        } catch (error) {
            console.error(
                `[Explainer] Attempt ${iteration + 1} generation error:`,
                error,
            );
            lastValidation = {
                valid: false,
                errors: [{ message: `Generation error: ${error}` }],
                warnings: [],
            };
        }
    }

    // All iterations failed
    console.error(
        `[Explainer] ❌ All ${MAX_ITERATIONS} attempts failed for chapter: ${params.chapterCaption}`,
        lastValidation
            ? `\nLast errors: ${JSON.stringify(lastValidation.errors, null, 2)}`
            : "",
    );

    // Return a fallback component
    return {
        jsxCode: generateFallbackComponent(params),
        keyTakeaways: params.chapterContent.slice(0, 3),
    };
}

/**
 * Build the prompt for the explainer agent
 * Includes previous code and ESLint errors for retry attempts
 */
function buildExplainerPrompt(
    params: {
        chapterIndex: number;
        chapterCaption: string;
        chapterContent: string[];
        chapterNote?: string;
        timeMinutes: number;
        allChapters: string;
        userQuery: string;
        difficulty: "easy" | "medium" | "hard";
        language: "en" | "id";
        ragContext?: string[];
    },
    previousCode?: string | null,
    previousValidation?: ValidationResult | null,
): string {
    // If this is a retry, provide focused error feedback
    if (previousCode && previousValidation && !previousValidation.valid) {
        const errorsJson = JSON.stringify(previousValidation.errors, null, 2);

        return `You were prompted before, but the code that you output did not pass the syntax validation check.

Your previous code:
\`\`\`jsx
${previousCode}
\`\`\`

Your code generated the following errors:
${errorsJson}

Please try again and rewrite your code from scratch, without explanation.
Your response should start with () => { and end with a closing curly brace }.

IMPORTANT:
- Fix ALL the errors mentioned above
- Do NOT include any text before or after the component code
- Do NOT include \`\`\`jsx tags
- Start immediately with () => {
`;
    }

    // Calculate content depth based on time allocated
    const sectionsPerPoint =
        params.timeMinutes >= 30 ? 3 : params.timeMinutes >= 15 ? 2 : 1;
    const totalSections = params.chapterContent.length * sectionsPerPoint;
    const estimatedLines = params.chapterContent.length * 150; // ~150 lines per learning point section

    // First attempt - full context prompt with COMPREHENSIVE requirements
    let prompt = `
## Course Context
**Original User Query:** ${params.userQuery}

**All Chapters in This Course:**
${params.allChapters}

---

## Your Assignment: Chapter ${params.chapterIndex + 1} - "${params.chapterCaption}"

You must create a COMPREHENSIVE, in-depth educational component for this chapter.

### Time Budget: ${params.timeMinutes} minutes of learning content
This means you need to create content that takes approximately ${params.timeMinutes} minutes to read and understand.
- For a ${params.timeMinutes}-minute chapter, create at least ${totalSections} distinct sections
- Each learning point below should have its own dedicated section with explanations, examples, and visualizations
- Aim for approximately ${estimatedLines} lines of JSX code to ensure sufficient depth

### Learning Points to Cover (EACH REQUIRES A FULL SECTION):
${params.chapterContent
    .map(
        (point, i) => `
**${i + 1}. ${point}**
   - Create a dedicated section with a clear heading (h2 or h3)
   - Provide detailed explanation (2-3 paragraphs minimum)
   - Include visual aids, latexs, or interactive elements
   - Add practical examples or real-world applications
   - Each section should take 3-5 minutes to read and understand
`,
    )
    .join("\n")}

${params.chapterNote ? `### Note from Course Planner: ${params.chapterNote}` : ""}

### Difficulty Level: ${params.difficulty}
${
    params.difficulty === "easy"
        ? "- Use simple language, many examples, step-by-step explanations\n- Include analogies and visual aids\n- Break complex concepts into smaller pieces\n- Add more interactive elements to keep engagement high"
        : params.difficulty === "medium"
          ? "- Balance theory with practical examples\n- Include code snippets and diagrams\n- Moderate technical depth\n- Use interactive elements to demonstrate concepts"
          : "- Use technical terminology\n- Include advanced concepts and edge cases\n- Provide in-depth mathematical/technical explanations\n- Complex visualizations and advanced patterns"
}

### Language: ${params.language === "en" ? "English" : "Indonesian"}

${
    params.ragContext && params.ragContext.length > 0
        ? `### Additional Context from User's Documents:
Reference this information where appropriate:

${params.ragContext.join("\n\n---\n\n")}`
        : ""
}

---

## CRITICAL REQUIREMENTS

1. **Minimum Content**: Your component MUST have exactly ${params.chapterContent.length} major sections, one for each learning point above
2. **Depth Per Section**: Each section needs:
   - A clear heading (h2 or h3)
   - 2-3 paragraphs of detailed explanation
   - At least one visual/interactive element (chart, diagram, latex, animation)
   - A practical example or real-world application
3. **Interactivity**: Include at least 2-3 interactive elements throughout the component (toggles, tabs, animations, buttons)
4. **Visualizations**: Use charts, diagrams, or latexs where appropriate - don't just use text
5. **Structure**: Use clear headings, consistent styling, and logical flow from one section to the next
6. **Content Length**: Your component should be substantial - aim for at least ${estimatedLines} lines of JSX

## Example Structure for a ${params.timeMinutes}-minute chapter:
\`\`\`
- Hero section with chapter title and brief intro
- Section 1: [Learning Point 1]
  - Heading
  - 2-3 explanation paragraphs
  - Visual/interactive element
  - Example or exercise
- Section 2: [Learning Point 2]
  - Heading
  - 2-3 explanation paragraphs
  - latex or diagram
  - Practical application
- ... (repeat for all ${params.chapterContent.length} learning points)
- Summary/Key Takeaways section
\`\`\`

Now create the React component. Start your response with () => { immediately.
`;

    return prompt;
}

/**
 * Extract key takeaways from the generated content
 */
function extractKeyTakeaways(
    jsxCode: string,
    contentPoints: string[],
): string[] {
    // Try to find key takeaways in the JSX (look for list items in a takeaways section)
    const takeawayMatches = jsxCode.match(
        /Key\s*Takeaways?|Summary|Remember/gi,
    );

    if (takeawayMatches) {
        // There's a takeaways section, but extracting from JSX is complex
        // Fall back to using the content points
        return contentPoints.slice(0, 5);
    }

    // Use the first few content points as key takeaways
    return contentPoints.slice(0, 5);
}

/**
 * Generate a fallback component if all retries fail
 */
function generateFallbackComponent(params: {
    chapterCaption: string;
    chapterContent: string[];
    language: "en" | "id";
}): string {
    const title = params.chapterCaption;
    const points = params.chapterContent
        .map((p) => `<li className="mb-2">${escapeJsxString(p)}</li>`)
        .join("\n          ");
    const errorMsg =
        params.language === "en"
            ? "We encountered an issue generating the interactive content. Here's a summary of this chapter:"
            : "Kami mengalami masalah dalam membuat konten interaktif. Berikut ringkasan bab ini:";

    return `() => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-12 border-b-4 border-blue-400 pb-8">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">${escapeJsxString(title)}</h1>
      </div>
      
      <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-yellow-800">${errorMsg}</p>
      </div>

      <div className="p-8 bg-white rounded-lg shadow-lg border-l-8 border-blue-400">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Learning Points</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          ${points}
        </ul>
      </div>
    </div>
  );
}`;
}

/**
 * Escape string for use in JSX
 */
function escapeJsxString(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$");
}

// Also export the markdown-based function for backwards compatibility
export { generateChapterContent as generateJsxChapterContent };

// Legacy markdown export (for backwards compatibility)
export const chapterContentSchema = z.object({
    content: z.string(),
    keyTakeaways: z.array(z.string()),
});
