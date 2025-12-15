import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Using Nunito as a close alternative to SF Pro Rounded (which requires licensing)
// Nunito has similar rounded, friendly characteristics
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Uxie - AI-Powered Learning Platform",
  description:
    "Transform static learning into interactive experiences with dynamic visualizations, adaptive exercises, and personalized AI tutoring.",
  keywords: [
    "AI learning",
    "interactive education",
    "personalized courses",
    "adaptive learning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${nunito.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
