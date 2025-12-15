import type { CourseRequest, FullCourse, Grading } from "@/types/course";

const MASTRA_API_URL =
    process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111";

// Generic agent call helper
export async function generateAgent<T>(
    agentName: string,
    prompt: string,
    options?: {
        output?: Record<string, string>;
        threadId?: string;
    },
): Promise<T> {
    const response = await fetch(
        `${MASTRA_API_URL}/api/agents/${agentName}/generate`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                ...(options?.output && { output: options.output }),
                ...(options?.threadId && { threadId: options.threadId }),
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agent error (${response.status}): ${errorText}`);
    }

    return response.json();
}

// Start course creation workflow
export async function createCourse(
    request: CourseRequest,
    courseId?: string,
): Promise<{ runId: string }> {
    // First, create a run
    const createRunResponse = await fetch(
        `${MASTRA_API_URL}/api/workflows/courseCreationWorkflow/create-run`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        },
    );

    if (!createRunResponse.ok) {
        const errorText = await createRunResponse.text();
        throw new Error(
            `Failed to create workflow run (${createRunResponse.status}): ${errorText}`,
        );
    }

    const { runId } = await createRunResponse.json();

    // Include courseId in the workflow input if provided
    const workflowInput = {
        ...request,
        ...(courseId && { courseId }),
    };

    // Then, start the run with runId as a query parameter
    const startResponse = await fetch(
        `${MASTRA_API_URL}/api/workflows/courseCreationWorkflow/start?runId=${runId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputData: workflowInput }),
        },
    );

    if (!startResponse.ok) {
        const errorText = await startResponse.text();
        throw new Error(
            `Workflow error (${startResponse.status}): ${errorText}`,
        );
    }

    return { runId };
}

// Get workflow run execution result
export async function getWorkflowRunStatus(runId: string): Promise<{
    status: "success" | "failed" | "suspended" | "running";
    result?: FullCourse;
    error?: string;
}> {
    // Use the execution result endpoint which provides the workflow state
    const response = await fetch(
        `${MASTRA_API_URL}/api/workflows/courseCreationWorkflow/runs/${runId}/execution-result`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        },
    );

    if (!response.ok) {
        // If execution result not found yet, workflow might still be running
        if (response.status === 404) {
            return { status: "running" };
        }
        const errorText = await response.text();
        throw new Error(
            `Workflow status error (${response.status}): ${errorText}`,
        );
    }

    const data = await response.json();

    // Extract status - can be in payload.workflowState.status or top-level
    const status =
        data.payload?.workflowState?.status || data.status || "running";

    // Extract result - can be in result field or payload.workflowState.result
    const result = data.result || data.payload?.workflowState?.result;

    // Extract error - can be in error field or payload.workflowState.error
    const error = data.error || data.payload?.workflowState?.error;

    return {
        status: status as "success" | "failed" | "suspended" | "running",
        result: status === "success" && result ? result : undefined,
        error:
            status === "failed" && error
                ? typeof error === "string"
                    ? error
                    : JSON.stringify(error)
                : undefined,
    };
}

// Poll workflow status until completion
export async function waitForWorkflowCompletion(
    runId: string,
    onProgress?: (status: string) => void,
    maxPolls = 300,
    intervalMs = 2000,
): Promise<FullCourse> {
    let pollCount = 0;

    while (pollCount < maxPolls) {
        const statusResult = await getWorkflowRunStatus(runId);

        // Check for success status (not "completed")
        if (statusResult.status === "success" && statusResult.result) {
            return statusResult.result;
        }

        if (statusResult.status === "failed") {
            throw new Error(statusResult.error || "Course generation failed");
        }

        if (statusResult.status === "suspended") {
            throw new Error(
                "Workflow was suspended. Manual intervention required.",
            );
        }

        // Still running - continue polling
        const progressPercent = Math.round((pollCount / maxPolls) * 100);
        onProgress?.(`Generating course... (${progressPercent}%)`);

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        pollCount++;
    }

    throw new Error("Course generation timed out");
}

// Grade an open-text answer
export async function gradeAnswer(params: {
    question: string;
    correctAnswer: string;
    userAnswer: string;
    gradingCriteria?: string;
    courseId: string;
}): Promise<Grading> {
    // Call the grader agent with structured output
    const response = await fetch(
        `${MASTRA_API_URL}/api/agents/graderAgent/generate`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: `## Grading Request

**Course ID:** ${params.courseId}

## Question
${params.question}

## Expected Correct Answer
${params.correctAnswer}

${params.gradingCriteria ? `## Grading Criteria\n${params.gradingCriteria}` : ""}

## User's Answer
${params.userAnswer}

Please grade this answer (0, 1, or 2 points) and provide constructive feedback.`,
                    },
                ],
                output: {
                    points: "number",
                    feedback: "string",
                },
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grading error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Extract the grading result - Mastra API may return it in different formats
    // Try to get the structured output object
    const grading = data.object || data.result || data;

    // Validate and ensure points is a valid number (0, 1, or 2)
    const points =
        typeof grading.points === "number"
            ? Math.max(0, Math.min(2, Math.round(grading.points))) // Clamp to 0-2 and round
            : 0; // Default to 0 if invalid

    const feedback = grading.feedback || "No feedback provided.";

    return {
        points,
        feedback,
    };
}

// Helper to create a grading function with courseId bound
export function createGradeAnswerWrapper(courseId: string) {
    return async (
        question: string,
        correctAnswer: string,
        userAnswer: string,
        gradingCriteria?: string,
    ): Promise<Grading> => {
        return gradeAnswer({
            question,
            correctAnswer,
            userAnswer,
            gradingCriteria,
            courseId,
        });
    };
}

// Chat with the AI about a chapter
export async function chatWithAgent(params: {
    message: string;
    courseId: string;
    chapterId: string;
    userId: string;
    chapterContent?: string;
    chapterCaption?: string;
}): Promise<{ message: string }> {
    const threadId = `chat-${params.courseId}-${params.chapterId}`;

    const contextPrompt = params.chapterCaption
        ? `[Context: Currently studying chapter "${params.chapterCaption}"]\n\n${params.message}`
        : params.message;

    const response = await fetch(
        `${MASTRA_API_URL}/api/agents/chatAgent/generate`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: contextPrompt }],
                threadId,
                resourceId: params.userId,
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Extract message from response (format may vary)
    const message =
        typeof data === "string"
            ? data
            : data.message || data.text || data.content || JSON.stringify(data);

    return { message };
}

// Stream chat response (if supported)
export async function chatWithAgentStream(
    params: {
        message: string;
        courseId: string;
        chapterId: string;
        userId: string;
        chapterCaption?: string;
    },
    onChunk: (chunk: string) => void,
): Promise<void> {
    const threadId = `chat-${params.courseId}-${params.chapterId}`;

    const contextPrompt = params.chapterCaption
        ? `[Context: Currently studying chapter "${params.chapterCaption}"]\n\n${params.message}`
        : params.message;

    const response = await fetch(
        `${MASTRA_API_URL}/api/agents/chatAgent/stream`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: contextPrompt }],
                threadId,
                resourceId: params.userId,
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat stream error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("No response body");
    }

    const decoder = new TextDecoder();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }
    } finally {
        reader.releaseLock();
    }
}

// Health check for the Mastra API
export async function checkMastraHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${MASTRA_API_URL}/api`, {
            method: "GET",
        });
        return response.ok;
    } catch {
        return false;
    }
}
