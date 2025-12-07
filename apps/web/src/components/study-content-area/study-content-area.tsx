"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChapterList, type ChapterItem } from "../chapter-list";
import { ChatWindow, type ChatMessage } from "../chat-window";
import { PrimaryButton } from "../button/button-primary";
import { SecondaryButton } from "../button/button-secondary";

export interface StudyContentAreaProps extends React.ComponentProps<"div"> {
  // Chapter data
  chapterTitle: string;
  chapterDuration?: string;
  chapters: ChapterItem[];
  onChapterClick?: (chapter: ChapterItem) => void;

  // Content
  content?: React.ReactNode;

  // Navigation
  hasPrevChapter?: boolean;
  hasNextChapter?: boolean;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;

  // Chat
  chatMessages?: ChatMessage[];
  onSendChatMessage?: (message: string) => void;
  showChat?: boolean;

  // Layout
  className?: string;
  sidebarCollapsed?: boolean;
}

export const StudyContentArea = React.forwardRef<
  HTMLDivElement,
  StudyContentAreaProps
>(
  (
    {
      className,
      chapterTitle,
      chapterDuration,
      chapters,
      onChapterClick,
      content,
      hasPrevChapter = false,
      hasNextChapter = false,
      onPrevChapter,
      onNextChapter,
      chatMessages = [],
      onSendChatMessage,
      showChat = true,
      sidebarCollapsed = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex gap-0 w-full h-full", className)}
        {...props}
      >
        {/* Sidebar - Study Navigation */}
        <aside
          className={cn(
            "sticky top-0 h-screen overflow-y-auto border-r border-border/60 glass-sm shrink-0",
            "bg-card",
            sidebarCollapsed ? "w-0 hidden" : "w-[240px] p-4",
          )}
        >
          <h3 className="text-base font-semibold text-foreground mb-4">
            Bab-bab
          </h3>
          <ChapterList
            chapters={chapters}
            onChapterClick={onChapterClick}
            simplified
          />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-8">
              {/* Content Header */}
              <div className="mb-8">
                <h1 className="text-[28px] font-semibold text-foreground mb-2">
                  {chapterTitle}
                </h1>
                {chapterDuration && (
                  <p className="text-[13px] font-normal text-muted-foreground">
                    Durasi: {chapterDuration}
                  </p>
                )}
              </div>

              {/* Article/Text Content */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {content || (
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
                        Pendahuluan
                      </h2>
                      <p className="text-[15px] font-normal text-foreground leading-relaxed mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                      </p>
                    </section>

                    <figure className="border border-border rounded-lg bg-muted p-4 my-6">
                      <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center mb-2">
                        <span className="text-muted-foreground">
                          [Diagram/Image]
                        </span>
                      </div>
                      <figcaption className="text-xs font-normal text-muted-foreground text-center mt-2">
                        Caption untuk diagram atau gambar
                      </figcaption>
                    </figure>

                    <section>
                      <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
                        Kesimpulan
                      </h2>
                      <p className="text-[15px] font-normal text-foreground leading-relaxed mb-4">
                        Kesimpulan dari materi pembelajaran ini.
                      </p>
                    </section>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-border">
                <SecondaryButton
                  onClick={onPrevChapter}
                  disabled={!hasPrevChapter}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Chapter
                </SecondaryButton>
                <PrimaryButton
                  onClick={onNextChapter}
                  disabled={!hasNextChapter}
                  className="flex items-center gap-2"
                >
                  Next Chapter
                  <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
              </div>
            </div>
          </div>

          {/* Chat Window Container */}
          {showChat && (
            <div className="sticky bottom-8 right-8 self-end mr-8 mb-8 z-10">
              <ChatWindow
                messages={chatMessages}
                onSendMessage={onSendChatMessage}
                defaultOpen={false}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

StudyContentArea.displayName = "StudyContentArea";
