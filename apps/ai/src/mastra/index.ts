import { Mastra } from "@mastra/core/mastra";
import { VercelDeployer } from "@mastra/deployer-vercel";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { PgVector } from "@mastra/pg";

// Agents
import { plannerAgent } from "./agents/planner-agent";
import { infoAgent } from "./agents/info-agent";
import { explainerAgent } from "./agents/explainer-agent";
import { quizAgent } from "./agents/quiz-agent";
import { graderAgent } from "./agents/grader-agent";
import { chatAgent } from "./agents/chat-agent";

// Workflows
import { courseCreationWorkflow } from "./workflows/course-creation-workflow";

// Vector store configuration
const pgVector =
    process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
        ? new PgVector({
              connectionString:
                  process.env.SUPABASE_DB_URL || process.env.DATABASE_URL!,
          })
        : undefined;

export const mastra = new Mastra({
    deployer: new VercelDeployer(),
    workflows: {
        courseCreationWorkflow,
    },
    agents: {
        plannerAgent,
        infoAgent,
        explainerAgent,
        quizAgent,
        graderAgent,
        chatAgent,
    },
    // Vector store for RAG - Mastra aligned pattern
    vectors: pgVector ? { pgVector } : undefined,
    storage: new LibSQLStore({
        // Use file-based storage for persistence, or memory for testing
        url: process.env.LIBSQL_URL || "file:../mastra.db",
    }),
    logger: new PinoLogger({
        name: "Uxie",
        level: "info",
    }),
    observability: {
        // Enables DefaultExporter and CloudExporter for AI tracing
        default: { enabled: true },
    },
    server: {
        // CORS configuration - allow requests from web app
        // In production, set ALLOWED_ORIGIN env var to your web app URL
        // Defaults to '*' (allow all) if not set, which works for development
        cors: {
            origin: process.env.ALLOWED_ORIGIN || "*",
            allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowHeaders: [
                "Content-Type",
                "Authorization",
                "x-mastra-client-type",
            ],
            exposeHeaders: ["Content-Length", "X-Requested-With"],
            credentials: false,
        },
    },
});

// Export workflow functions and types for direct usage
export {
    createCourse,
    createCourseWithProgress,
    type FullCourse,
    type FullChapter,
} from "./workflows/course-creation-workflow";

// Export agent functions for direct usage
export { generateCourseInfo } from "./agents/info-agent";
export { generateLearningPath } from "./agents/planner-agent";
export {
    generateChapterContent,
    generateJsxChapterContent,
    type JsxChapterContent,
} from "./agents/explainer-agent";
export {
    generateQuiz,
    type Quiz,
    type MCQuestion,
    type OpenTextQuestion,
} from "./agents/quiz-agent";
export { gradeAnswer } from "./agents/grader-agent";
export { chatAboutChapter } from "./agents/chat-agent";

// Export vector store tools (Mastra aligned)
export {
    addToVectorStore,
    searchVectorStore,
    getChapterRAGContextTool,
    getRAGContextForChapter,
    courseHasDocuments,
    addChunksToVectorStore,
    getPgVector,
    EMBEDDINGS_INDEX,
    initializeVectorStore,
} from "./tools/supabase-vector";

// Export embedding tools (AI SDK aligned)
export {
    generateEmbedding,
    generateEmbeddings,
    generateEmbeddingTool,
    generateEmbeddingsTool,
    chunkText,
    chunkTextTool,
    EMBEDDING_DIMENSION,
} from "./tools/embeddings";

// Export document processing tools (Mastra RAG aligned)
export {
    processDocumentTool,
    processDocumentsTool,
    processRawTextTool,
    processDocumentsForCourse,
    type DocumentType,
} from "./tools/document-processor";

// Export Unsplash tools
export { searchUnsplashPhotos, getUnsplashImageUrl } from "./tools/unsplash";

// Export JSX validation tools
export {
    validateJsx,
    extractJsxCode,
    findReactCodeInResponse,
    cleanUpResponse,
    validateJsxWithEslint,
    PLUGIN_IMPORTS,
    type ValidationResult,
} from "./tools/jsx-validator";

// Export plugin docs for reference
export {
    ALL_PLUGIN_DOCS,
    AVAILABLE_PLUGINS,
    LATEX_DOCS,
    CHARTS_DOCS,
    PLOTS_DOCS,
    CODE_DOCS,
    DIAGRAMS_DOCS,
    MOTION_DOCS,
} from "./agents/explainer-agent/plugin-docs";

// Export Supabase service functions
export {
    createCourseRecord,
    updateCourseStatus,
    updateCourseInfo,
    getCourse,
    getUserCourses,
    saveChapter,
    getCourseChapters,
    saveQuestions,
    getChapterQuestions,
    saveUserProgress,
    getUserCourseProgress,
    saveFullCourse,
    loadFullCourse,
    deleteCourse,
    getCourseProgressSummary,
    type CourseRecord,
    type ChapterRecord,
    type QuestionRecord,
    type UserProgressRecord,
} from "./services/supabase";

// Export schemas
export * from "./schemas/course";

// Re-export PgVector for external use
export { PgVector } from "@mastra/pg";
