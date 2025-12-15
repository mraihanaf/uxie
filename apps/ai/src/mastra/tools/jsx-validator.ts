import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ESLint } from "eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * Plugin imports that are available in the frontend
 * These will be prepended to the code for validation
 */
const PLUGIN_IMPORTS = `
import * as Recharts from 'recharts';
import React from "react";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import Plot from 'react-plotly.js';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import * as RF from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from "motion/react";
`;

// Count lines in plugin imports for line number adjustment
const IMPORT_LINE_COUNT = PLUGIN_IMPORTS.split("\n").length;

/**
 * Create ESLint instance with React/JSX configuration
 * Reusable across validations for better performance
 */
function createEslintInstance(): ESLint {
    return new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ["**/*.jsx"],
                plugins: {
                    react: reactPlugin,
                    "react-hooks": reactHooksPlugin,
                },
                languageOptions: {
                    ecmaVersion: 2022,
                    sourceType: "module",
                    parserOptions: {
                        ecmaFeatures: { jsx: true },
                    },
                    globals: {
                        ...globals.browser,
                        // React and plugin globals
                        React: "readonly",
                        Recharts: "readonly",
                        Latex: "readonly",
                        Plot: "readonly",
                        SyntaxHighlighter: "readonly",
                        dark: "readonly",
                        RF: "readonly",
                        motion: "readonly",
                    },
                },
                rules: {
                    // =================
                    // FATAL ERRORS (will cause component to crash/not render)
                    // =================
                    "no-undef": "error",
                    "no-dupe-keys": "error",
                    "no-dupe-args": "error",
                    "no-unreachable": "error",
                    "no-func-assign": "error",
                    "no-import-assign": "error",
                    "no-obj-calls": "error",
                    "no-sparse-arrays": "error",
                    "no-unexpected-multiline": "error",
                    "use-isnan": "error",
                    "valid-typeof": "error",

                    // React-specific fatal errors
                    "react/jsx-key": "error",
                    "react/jsx-no-duplicate-props": "error",
                    "react/jsx-no-undef": "error",
                    "react/no-children-prop": "error",
                    "react/no-danger-with-children": "error",
                    "react/no-direct-mutation-state": "error",
                    "react/no-string-refs": "error",
                    "react/require-render-return": "error",

                    // React Hooks rules (breaking these causes crashes)
                    "react-hooks/rules-of-hooks": "error",
                    "react-hooks/exhaustive-deps": "warn",

                    // =================
                    // WARNINGS (style issues, won't break component)
                    // =================
                    "no-unused-vars": "warn",
                    "no-console": "off", // Allow console in educational content
                    "react/react-in-jsx-scope": "off", // Not needed in modern React
                    "react/jsx-uses-react": "off",
                    "react/prop-types": "off", // We're not using prop-types
                },
                settings: {
                    react: {
                        version: "detect",
                    },
                },
            },
        ],
    });
}

// Lazy-initialized ESLint instance
let eslintInstance: ESLint | null = null;

function getEslintInstance(): ESLint {
    if (!eslintInstance) {
        eslintInstance = createEslintInstance();
    }
    return eslintInstance;
}

/**
 * Validation result type
 */
export interface ValidationResult {
    valid: boolean;
    errors: Array<{ message: string; line?: number; ruleId?: string }>;
    warnings: Array<{ message: string; line?: number; ruleId?: string }>;
}

/**
 * Validate JSX code using ESLint programmatic API
 */
export async function validateJsxWithEslint(
    code: string,
): Promise<ValidationResult> {
    const codeWithImports = PLUGIN_IMPORTS + "\n" + code;

    try {
        const eslint = getEslintInstance();
        const results = await eslint.lintText(codeWithImports, {
            filePath: "virtual-component.jsx",
        });

        const messages = results[0]?.messages || [];

        // Adjust line numbers to account for plugin imports
        const errors = messages
            .filter((msg) => msg.severity === 2)
            .map((msg) => ({
                message: msg.message,
                line: msg.line ? msg.line - IMPORT_LINE_COUNT : undefined,
                ruleId: msg.ruleId || undefined,
            }));

        const warnings = messages
            .filter((msg) => msg.severity === 1)
            .map((msg) => ({
                message: msg.message,
                line: msg.line ? msg.line - IMPORT_LINE_COUNT : undefined,
                ruleId: msg.ruleId || undefined,
            }));

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    } catch (error) {
        console.error("[ESLint] Validation error:", error);
        return {
            valid: false,
            errors: [{ message: `ESLint validation error: ${error}` }],
            warnings: [],
        };
    }
}

/**
 * Extract React component code from AI response
 * Handles arrow functions, regular functions, and various patterns
 */
export function findReactCodeInResponse(text: string): string | null {
    // Check if string contains JSX elements
    const isJsxElement = (s: string): boolean => {
        const jsxPatterns = [
            /<[A-Z][a-zA-Z0-9]*[^>]*>/, // Component tags like <MyComponent>
            /<[a-z]+[^>]*>/, // HTML tags like <div>, <span>
            /<[^>]+\s*\/>/, // Self-closing tags like <img />
            /\{\s*[^}]*\s*\}/, // JSX expressions like {variable}
        ];
        return jsxPatterns.some((pattern) => pattern.test(s));
    };

    // Extract balanced braces
    const extractBalancedBraces = (
        text: string,
        startPos: number,
    ): [string | null, number] => {
        if (startPos >= text.length || text[startPos] !== "{") {
            return [null, startPos];
        }

        let braceCount = 0;
        let i = startPos;

        while (i < text.length) {
            const char = text[i];
            if (char === "{") {
                braceCount++;
            } else if (char === "}") {
                braceCount--;
                if (braceCount === 0) {
                    return [text.slice(startPos, i + 1), i + 1];
                }
            }
            i++;
        }

        return [null, startPos];
    };

    // Extract complete function body
    const extractFunctionBody = (
        text: string,
        startPos: number,
    ): string | null => {
        const bracePos = text.indexOf("{", startPos);
        if (bracePos === -1) return null;

        const [body, endPos] = extractBalancedBraces(text, bracePos);
        if (body === null) return null;

        return text.slice(startPos, endPos);
    };

    // Patterns to identify React components
    const reactPatterns = [
        /\([^)]*\)\s*=>\s*\{/, // Arrow functions: () => {}, (props) => {}
        /function\s+[A-Z][a-zA-Z0-9]*\s*\([^)]*\)\s*\{/, // function ComponentName() {}
        /function\s*\([^)]*\)\s*\{/, // function() {}
        /const\s+[A-Z][a-zA-Z0-9]*\s*=\s*\([^)]*\)\s*=>\s*\{/, // const Component = () => {}
    ];

    const candidates: [number, string][] = [];

    for (const pattern of reactPatterns) {
        let match;
        const regex = new RegExp(pattern.source, "gi");
        while ((match = regex.exec(text)) !== null) {
            const startPos = match.index;
            const completeFunction = extractFunctionBody(text, startPos);
            if (completeFunction && isJsxElement(completeFunction)) {
                candidates.push([startPos, completeFunction]);
            }
        }
    }

    if (candidates.length > 0) {
        candidates.sort((a, b) => a[0] - b[0]);
        return candidates[0][1];
    }

    return null;
}

/**
 * Clean up the response to extract just the component function
 */
function cleanUpResponse(codeString: string): string {
    const code = findReactCodeInResponse(codeString);
    if (!code) return codeString.trim();

    const cleanedCode = code.trim();

    // Remove function wrapper patterns to get just the body
    const patterns = [
        /^\s*\([^)]*\)\s*=>\s*\{/, // Arrow functions
        /^\s*function\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{/, // Named functions
        /^\s*function\s*\([^)]*\)\s*\{/, // Anonymous functions
        /^\s*const\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*\([^)]*\)\s*=>\s*\{/, // Const arrow
    ];

    for (const pattern of patterns) {
        if (pattern.test(cleanedCode)) {
            return cleanedCode.replace(pattern, "").trim();
        }
    }

    return cleanedCode;
}

/**
 * JSX Validator Tool using ESLint
 * Validates JSX code generated by the AI with full React plugin support
 */
export const validateJsx = createTool({
    id: "validate-jsx",
    description:
        "Validate JSX code using ESLint with React plugins. Checks for syntax errors, undefined variables, hooks violations, and common React mistakes.",
    inputSchema: z.object({
        code: z.string().describe("The JSX code to validate"),
    }),
    outputSchema: z.object({
        valid: z.boolean(),
        cleanedCode: z.string().optional(),
        errors: z.array(
            z.object({
                message: z.string(),
                line: z.number().optional(),
                ruleId: z.string().optional(),
            }),
        ),
        warnings: z.array(
            z.object({
                message: z.string(),
                line: z.number().optional(),
                ruleId: z.string().optional(),
            }),
        ),
    }),
    execute: async ({ context }) => {
        // First, try to extract React code from the response
        const extractedCode = findReactCodeInResponse(context.code);

        if (!extractedCode) {
            return {
                valid: false,
                errors: [
                    {
                        message:
                            "Could not find valid React component. Code should start with () => { and contain JSX.",
                    },
                ],
                warnings: [],
            };
        }

        // Validate with ESLint
        const validation = await validateJsxWithEslint(extractedCode);

        if (!validation.valid) {
            return {
                valid: false,
                errors: validation.errors,
                warnings: validation.warnings,
            };
        }

        return {
            valid: true,
            cleanedCode: extractedCode,
            errors: [],
            warnings: validation.warnings,
        };
    },
});

/**
 * Extract and validate JSX code from AI response
 */
export const extractJsxCode = createTool({
    id: "extract-jsx-code",
    description:
        "Extract, validate, and clean JSX component code from AI response text.",
    inputSchema: z.object({
        response: z.string().describe("The AI response containing JSX code"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        code: z.string().optional(),
        errors: z
            .array(
                z.object({
                    message: z.string(),
                    line: z.number().optional(),
                    ruleId: z.string().optional(),
                }),
            )
            .optional(),
        message: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const extracted = findReactCodeInResponse(context.response);

        if (!extracted) {
            return {
                success: false,
                message: "No valid React component found in response",
            };
        }

        // Validate the extracted code
        const validation = await validateJsxWithEslint(extracted);

        if (!validation.valid) {
            return {
                success: false,
                code: extracted,
                errors: validation.errors,
                message: `Code has ${validation.errors.length} error(s)`,
            };
        }

        return {
            success: true,
            code: extracted,
        };
    },
});

// Export utilities for use in agents
export { cleanUpResponse, PLUGIN_IMPORTS };
