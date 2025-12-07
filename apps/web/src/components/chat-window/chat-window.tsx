"use client";

import * as React from "react";
import { Bot, Minimize2, Maximize2, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp?: Date;
}

export interface ChatWindowProps extends React.ComponentProps<"div"> {
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  className?: string;
  defaultOpen?: boolean;
}

export const ChatWindow = React.forwardRef<HTMLDivElement, ChatWindowProps>(
  (
    {
      className,
      messages = [],
      onSendMessage,
      placeholder = "Ketik pesan...",
      defaultOpen = true,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const [isMinimized, setIsMinimized] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const chatBodyRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSend = () => {
      if (inputValue.trim() && onSendMessage) {
        onSendMessage(inputValue.trim());
        setInputValue("");
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "w-[320px] max-w-[90vw] rounded-xl border border-border glass-sm shadow-lg",
          "bg-card",
          isMinimized ? "h-auto" : "h-[420px]",
          "flex flex-col",
          className,
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-4 py-3 bg-secondary/20 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-foreground" />
            <span className="text-sm font-semibold text-foreground">
              AI Tutor
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Minimize2 className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-destructive/10 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        {/* Body - Messages */}
        {!isMinimized && (
          <>
            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  <p>Mulai percakapan dengan AI Tutor</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-xl px-4 py-3 max-w-[85%] text-[13px] font-normal leading-relaxed",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer - Input */}
            <div className="h-14 px-4 py-3 border-t border-border bg-card shrink-0">
              <div className="flex items-center gap-2 h-8">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="flex-1 h-full px-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="h-8 w-10 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  },
);

ChatWindow.displayName = "ChatWindow";
