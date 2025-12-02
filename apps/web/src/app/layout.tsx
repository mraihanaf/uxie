import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationBar } from "@/components/navigation-bar";
import { Sidebar } from "@/components/sidebar";
import { MainContentWrapper } from "@/components/main-content-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uxie - Platform Pendidikan Futuristik",
  description: "Platform Pendidikan Futuristik untuk Masa Depan Lebih Baik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="light">
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
              <Sidebar />
              <MainContentWrapper>{children}</MainContentWrapper>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
