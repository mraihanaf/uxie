import { useMemo } from "react";

import * as React from "react";

import * as Recharts from "recharts";

import Plot from "react-plotly.js";

import * as RF from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { vscDarkPlus as dark } from "react-syntax-highlighter/dist/esm/styles/prism";

import Latex from "react-latex-next";

import { motion } from "motion/react";

// @ts-expect-error - @babel/standalone doesn't have type definitions
import { transform } from "@babel/standalone";

interface ChapterViewerProps {
  chapter: {
    caption: string;
    jsx_content: string | null;
    key_takeaways?: string[] | null;
  } | null;
}

const ChapterViewer = ({ chapter }: ChapterViewerProps) => {
  // Render the JSX code string as a React component
  const Component = useMemo(() => {
    if (!chapter?.jsx_content) {
      return null;
    }

    try {
      // Transform JSX to JavaScript using Babel
      // The jsxContent is already a function string like "() => { ... }"
      const transformedCode = transform(chapter.jsx_content, {
        presets: ["react"],
        plugins: [],
      }).code;

      // Create a function that evaluates the transformed code with all dependencies in scope
      // The transformed code is a function expression, so we return it
      // We provide both RF (for RF.ReactFlow) and individual components (for direct ReactFlow usage)
      const createComponent = new Function(
        "React",
        "Recharts",
        "Plot",
        "RF",
        "ReactFlow",
        "Controls",
        "Background",
        "SyntaxHighlighter",
        "dark",
        "Latex",
        "motion",
        `return ${transformedCode}`,
      );

      return createComponent(
        React,
        Recharts,
        Plot,
        RF, // For code that uses RF.ReactFlow
        RF.ReactFlow, // For code that uses ReactFlow directly
        RF.Controls, // For code that uses Controls directly
        RF.Background, // For code that uses Background directly
        SyntaxHighlighter,
        dark,
        Latex,
        motion,
      );
    } catch (error) {
      console.error("Error rendering JSX code:", error);
      const ErrorComponent = () => (
        <div className="p-8 bg-red-50 border-l-4 border-red-400 rounded">
          <h3 className="text-xl font-bold mb-2 text-red-800">
            Error Rendering Content
          </h3>
          <p className="text-red-700">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <pre className="mt-4 text-xs overflow-auto">
            {error instanceof Error ? error.stack : String(error)}
          </pre>
        </div>
      );
      ErrorComponent.displayName = "ErrorComponent";
      return ErrorComponent;
    }
  }, [chapter?.jsx_content]);

  if (!chapter) {
    return <div>No chapter selected</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {Component ? (
        <Component />
      ) : (
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-4">{chapter.caption}</h2>
          <p className="text-gray-600">
            No content available for this chapter.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChapterViewer;
