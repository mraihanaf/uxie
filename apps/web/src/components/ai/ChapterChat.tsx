"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, MessageCircle, Loader2, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChapterChatProps {
  courseId: string;
  chapterId: string;
  chapterCaption: string;
  onSendMessage: (message: string) => Promise<string>;
  className?: string;
  initialMessages?: Message[];
}

export default function ChapterChat({
  chapterCaption,
  onSendMessage,
  className,
  initialMessages = [],
}: ChapterChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await onSendMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Collapsed state - just shows a floating button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 size-14 rounded-full",
          "bg-gradient-to-br from-[var(--accent-lilac)] to-[var(--accent-pink)]",
          "text-white shadow-floating",
          "flex items-center justify-center",
          "hover:scale-105 transition-transform duration-200",
          "md:bottom-8 md:right-8",
          className,
        )}
      >
        <MessageCircle className="size-6" />
      </button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 w-[calc(100vw-48px)] max-w-md",
        "border-0 shadow-floating overflow-hidden",
        "flex flex-col h-[500px] max-h-[70vh]",
        "md:bottom-8 md:right-8",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[var(--accent-lilac)] to-[var(--accent-pink)] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Learning Assistant</h3>
              <p className="text-xs text-white/80 truncate max-w-[200px]">
                {chapterCaption}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="size-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background-subtle)]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="size-16 rounded-full bg-[var(--pastel-lilac)] mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="size-8 text-[var(--accent-lilac)]" />
            </div>
            <h4 className="font-semibold mb-1">Ask me anything!</h4>
            <p className="text-sm text-[var(--foreground-muted)]">
              I&apos;m here to help you understand this chapter better.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "Explain the main concept",
                "Give me an example",
                "What are the key takeaways?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 text-xs rounded-full bg-white border border-border hover:border-[var(--accent-lilac)] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div
              className={cn(
                "size-8 rounded-full flex items-center justify-center shrink-0",
                message.role === "user"
                  ? "bg-[var(--accent-lilac)]"
                  : "bg-white border border-border",
              )}
            >
              {message.role === "user" ? (
                <User className="size-4 text-white" />
              ) : (
                <Bot className="size-4 text-[var(--accent-lilac)]" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm",
                message.role === "user"
                  ? "bg-[var(--accent-lilac)] text-white rounded-tr-sm"
                  : "bg-white border border-border rounded-tl-sm",
              )}
            >
              {message.role === "assistant" ? (
                <div
                  className="prose prose-sm max-w-none 
                    prose-p:my-1 prose-p:leading-relaxed
                    prose-ul:my-2 prose-li:my-0.5
                    prose-code:bg-muted prose-code:px-1 prose-code:rounded
                    prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg"
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-white border border-border flex items-center justify-center shrink-0">
              <Bot className="size-4 text-[var(--accent-lilac)]" />
            </div>
            <div className="bg-white border border-border p-3 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-[var(--accent-lilac)]" />
                <span className="text-sm text-[var(--foreground-muted)]">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-border"
      >
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Inline chat variant (not floating)
export function InlineChapterChat({
  chapterCaption,
  onSendMessage,
  className,
  initialMessages = [],
}: ChapterChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await onSendMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("border-0 shadow-raised overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 bg-[var(--pastel-lilac)] border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[var(--accent-lilac)] flex items-center justify-center">
            <MessageCircle className="size-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Chat about this chapter</h3>
            <p className="text-sm text-[var(--foreground-secondary)]">
              Ask questions about: {chapterCaption}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[350px] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-[var(--foreground-muted)]">
            <p>No messages yet. Ask a question to get started!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div
              className={cn(
                "size-8 rounded-full flex items-center justify-center shrink-0",
                message.role === "user"
                  ? "bg-[var(--accent-lilac)]"
                  : "bg-muted",
              )}
            >
              {message.role === "user" ? (
                <User className="size-4 text-white" />
              ) : (
                <Bot className="size-4 text-[var(--accent-lilac)]" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm",
                message.role === "user"
                  ? "bg-[var(--accent-lilac)] text-white"
                  : "bg-muted",
              )}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="size-4 text-[var(--accent-lilac)]" />
            </div>
            <div className="bg-muted p-3 rounded-2xl">
              <Loader2 className="size-4 animate-spin text-[var(--accent-lilac)]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || loading}>
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
