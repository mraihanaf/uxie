"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { StudyContentArea } from "@/components/study-content-area";
import { ImageContainer } from "@/components/image-container";
import { ChatWindow, type ChatMessage } from "@/components/chat-window";
import { ChapterList, type ChapterItem } from "@/components/chapter-list";

// Mock data - replace with real data from API
const mockChapters: ChapterItem[] = [
  {
    id: "1",
    title: "Pendahuluan Romawi Kuno",
    duration: "15 min",
    status: "completed",
  },
  {
    id: "2",
    title: "Republik Romawi",
    duration: "20 min",
    status: "active",
  },
  {
    id: "3",
    title: "Perkembangan Kekaisaran",
    duration: "18 min",
    status: "completed",
  },
  {
    id: "4",
    title: "Kejatuhan Romawi",
    duration: "22 min",
    status: "locked",
  },
];

const mockChapterContent: Record<
  string,
  { title: string; duration: string; content: React.ReactNode }
> = {
  "1": {
    title: "BAB 1: Pendahuluan Romawi Kuno",
    duration: "15 menit",
    content: (
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
            Pendahuluan
          </h2>
          <p className="text-[15px] font-normal text-foreground leading-relaxed mb-4">
            Romawi Kuno adalah peradaban yang berkembang di semenanjung Italia
            dari abad ke-8 SM hingga abad ke-5 M. Peradaban ini memiliki
            pengaruh yang sangat besar terhadap perkembangan budaya, politik,
            dan hukum di Eropa dan dunia.
          </p>
        </section>

        <figure>
          <ImageContainer
            src="/images/placeholder-diagram.png"
            alt="Peta Romawi Kuno"
            caption="Gambar 1: Peta Ekspansi Romawi Kuno"
            zoomable
            maxHeight={400}
            onZoomClick={() => {
              // Handle zoom click
            }}
            width={800}
            height={400}
          />
        </figure>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
            Kesimpulan
          </h2>
          <p className="text-[15px] font-normal text-foreground leading-relaxed mb-4">
            Pendahuluan ini memberikan gambaran umum tentang peradaban Romawi
            Kuno dan pentingnya mempelajari sejarahnya.
          </p>
        </section>
      </div>
    ),
  },
  "2": {
    title: "BAB 2: Republik Romawi",
    duration: "20 menit",
    content: (
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
            Pendahuluan
          </h2>
          <p className="text-[15px] font-normal text-foreground leading-relaxed mb-4">
            Republik Romawi merupakan sistem pemerintahan yang berkembang
            setelah Kerajaan Romawi. Periode ini ditandai dengan pembagian
            kekuasaan dan sistem pemerintahan yang lebih demokratis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
            Struktur Pemerintahan
          </h2>
          <p className="text-[15px] font-normal text-foreground leading-relaxed mb-4">
            Sistem pemerintahan Republik Romawi terdiri dari berbagai institusi
            seperti Senat, Majelis, dan berbagai jabatan konsuler.
          </p>
        </section>

        <figure>
          <ImageContainer
            src="/images/placeholder-diagram.png"
            alt="Diagram Struktur Pemerintahan Romawi"
            caption="Gambar 2: Struktur Pemerintahan Republik Romawi"
            zoomable
            maxHeight={400}
            onZoomClick={() => {
              // Handle zoom click
            }}
            width={800}
            height={400}
          />
        </figure>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
            Kesimpulan
          </h2>
          <p className="text-[15px] font-normal text-foreground leading-relaxed mb-4">
            Republik Romawi merupakan landasan penting dalam perkembangan sistem
            pemerintahan modern di dunia Barat.
          </p>
        </section>
      </div>
    ),
  },
};

export default function StudyViewPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params?.chapterId as string;

  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Halo! Ada yang bisa saya bantu tentang materi ini?",
      timestamp: new Date(),
    },
  ]);

  const currentChapter = mockChapters.find((ch) => ch.id === chapterId);
  const chapterContent = mockChapterContent[chapterId] || {
    title: "Chapter Not Found",
    duration: "",
    content: <p>Chapter content not available.</p>,
  };

  const currentIndex = mockChapters.findIndex((ch) => ch.id === chapterId);
  const hasPrevChapter = currentIndex > 0;
  const hasNextChapter =
    currentIndex < mockChapters.length - 1 &&
    mockChapters[currentIndex + 1]?.status !== "locked";

  const handleChapterClick = (chapter: ChapterItem) => {
    if (chapter.status !== "locked") {
      router.push(`/dashboard/study-view/${chapter.id}`);
    }
  };

  const handlePrevChapter = () => {
    if (hasPrevChapter && currentIndex > 0) {
      const prevChapter = mockChapters[currentIndex - 1];
      router.push(`/dashboard/study-view/${prevChapter.id}`);
    }
  };

  const handleNextChapter = () => {
    if (hasNextChapter && currentIndex < mockChapters.length - 1) {
      const nextChapter = mockChapters[currentIndex + 1];
      if (nextChapter.status !== "locked") {
        router.push(`/dashboard/study-view/${nextChapter.id}`);
      }
    }
  };

  const handleSendChatMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Terima kasih atas pertanyaannya! Saya akan membantu menjelaskan lebih detail tentang materi ini.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <StudyContentArea
        chapterTitle={chapterContent.title}
        chapterDuration={chapterContent.duration}
        chapters={mockChapters}
        onChapterClick={handleChapterClick}
        content={chapterContent.content}
        hasPrevChapter={hasPrevChapter}
        hasNextChapter={hasNextChapter}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        chatMessages={chatMessages}
        onSendChatMessage={handleSendChatMessage}
        showChat={true}
      />
    </div>
  );
}
