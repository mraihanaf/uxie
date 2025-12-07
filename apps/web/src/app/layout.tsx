import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { MainContentWrapper } from "@/components/main-content-wrapper";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('uxie-theme');
                  if (!theme) {
                    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = isDark ? 'dark' : 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                  
                  var highContrast = localStorage.getItem('uxie-high-contrast');
                  if (highContrast === 'true') {
                    document.documentElement.classList.add('high-contrast');
                  }
                  
                  var reduceAnimations = localStorage.getItem('uxie-reduce-animations');
                  if (reduceAnimations === 'true') {
                    document.documentElement.classList.add('reduce-motion');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
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
