"use client";

import React, { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Lazy load the string-to-react-component for better performance
const StringToReactComponent = lazy(() => import("string-to-react-component"));

// Import all visualization libraries
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
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

// Paper background wrapper - matching design.json aesthetic
const PaperBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-full w-full bg-white rounded-2xl p-6 md:p-8">
      {children}
    </div>
  );
};

// Error fallback component - styled to match design system
const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="p-6 rounded-2xl bg-red-50 border border-red-200">
    <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
      <span className="size-6 rounded-full bg-red-100 flex items-center justify-center text-sm">
        !
      </span>
      Rendering Error
    </h3>
    <p className="text-red-600 text-sm mb-4">{error.message}</p>
    <details className="text-xs text-[var(--foreground-muted)] mb-4">
      <summary className="cursor-pointer hover:text-foreground">
        Error Details
      </summary>
      <pre className="mt-2 p-3 bg-red-100/50 rounded-xl overflow-auto font-mono">
        {error.stack}
      </pre>
    </details>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Loading component - matching design system
const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
    <div className="relative size-14 mb-6">
      <div className="absolute inset-0 border-4 border-[var(--pastel-lilac)] rounded-full" />
      <div className="absolute inset-0 border-4 border-t-[var(--accent-lilac)] border-r-[var(--accent-lilac)] rounded-full animate-spin" />
    </div>
    <h3 className="text-lg font-semibold mb-1">Loading Content...</h3>
    <p className="text-[var(--foreground-muted)] text-sm text-center">
      Preparing interactive components
    </p>
  </div>
);

// Props interface
interface AiCodeWrapperProps {
  children: string; // The JSX code string
  showBackground?: boolean;
  className?: string;
}

// The main component
export default function AiCodeWrapper({
  children,
  showBackground = true,
  className = "",
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
        <div className={`ai-content-wrapper ${className}`}>
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

// Export the Loader for reuse
export { Loader as AiContentLoader };
