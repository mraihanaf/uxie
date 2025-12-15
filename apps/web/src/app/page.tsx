import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { CardFeature, CardPastel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  BookOpen,
  Brain,
  MessageCircle,
  Globe,
  Clock,
  ArrowRight,
  Play,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopNav transparent />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="content-grid">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Copy */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="lilac" size="lg" className="gap-2">
                  <Sparkles className="size-3.5" />
                  AI-Powered Learning
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  Learn anything with{" "}
                  <span className="bg-gradient-to-r from-[var(--accent-lilac)] to-[var(--accent-pink)] bg-clip-text text-transparent">
                    interactive AI
                  </span>{" "}
                  courses
                </h1>
                <p className="text-lg md:text-xl text-[var(--foreground-secondary)] max-w-xl">
                  Transform any topic into an engaging learning experience with
                  dynamic visualizations, adaptive exercises, and personalized
                  AI tutoring.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="xl" className="w-full sm:w-auto gap-2">
                    Start learning free
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full sm:w-auto gap-2"
                  >
                    <Play className="size-4" />
                    See how it works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Floating Cards */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-8 -left-8 w-[140%]">
                {/* Main preview card */}
                <div className="bg-white rounded-3xl shadow-floating p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-[var(--accent-lilac)] to-[var(--accent-pink)] flex items-center justify-center">
                      <Brain className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Machine Learning Basics</h3>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        4 chapters • 2 hours
                      </p>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-br from-[var(--pastel-lilac)] to-[var(--pastel-blue)] rounded-xl flex items-center justify-center">
                    <span className="text-4xl">🤖</span>
                  </div>
                </div>

                {/* Floating tag pills */}
                <div className="absolute -top-4 right-8 pill-lilac shadow-sm transform -rotate-6">
                  Interactive Charts
                </div>
                <div className="absolute top-20 -right-4 pill-pink shadow-sm transform rotate-3">
                  AI Quizzes
                </div>
                <div className="absolute bottom-20 -left-8 pill-blue shadow-sm transform -rotate-3">
                  Live Explanations
                </div>

                {/* Progress card */}
                <div className="absolute bottom-0 right-0 bg-white rounded-2xl shadow-raised p-4 w-48 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <p className="text-xs text-[var(--foreground-muted)] mb-2">
                    Your Progress
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-green)] rounded-full"
                        style={{ width: "75%" }}
                      />
                    </div>
                    <span className="text-sm font-semibold">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-y bg-white">
        <div className="content-grid">
          <div className="text-center mb-16">
            <Badge variant="blue" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learning reimagined
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Our AI transforms any topic into an interactive course tailored to
              your level and learning style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles className="size-6" />,
                title: "AI-Generated Content",
                description:
                  "Enter any topic and our AI creates comprehensive, structured courses with chapters, quizzes, and exercises.",
                color: "lilac",
              },
              {
                icon: <BookOpen className="size-6" />,
                title: "Interactive Visualizations",
                description:
                  "Complex concepts come alive with dynamic charts, diagrams, code examples, and mathematical formulas.",
                color: "blue",
              },
              {
                icon: <Brain className="size-6" />,
                title: "Adaptive Quizzes",
                description:
                  "AI-graded assessments test your understanding and provide personalized feedback to improve retention.",
                color: "pink",
              },
              {
                icon: <MessageCircle className="size-6" />,
                title: "AI Tutor Chat",
                description:
                  "Ask questions about any chapter and get instant, contextual explanations from your AI learning assistant.",
                color: "green",
              },
              {
                icon: <Globe className="size-6" />,
                title: "Bilingual Support",
                description:
                  "Learn in English or Indonesian with full language support for content, quizzes, and AI interactions.",
                color: "yellow",
              },
              {
                icon: <Clock className="size-6" />,
                title: "Flexible Duration",
                description:
                  "Customize course length from quick 30-minute overviews to comprehensive 30-hour deep dives.",
                color: "lilac",
              },
            ].map((feature, index) => (
              <CardFeature key={index} className="p-6">
                <div
                  className={`size-12 rounded-2xl bg-[var(--pastel-${feature.color})] flex items-center justify-center text-[var(--accent-${feature.color})] mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {feature.description}
                </p>
              </CardFeature>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-y">
        <div className="content-grid">
          <div className="text-center mb-16">
            <Badge variant="pink" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From topic to mastery in 3 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter your topic",
                description:
                  "Type what you want to learn, select your difficulty level, and choose how long you want to study.",
                color: "lilac",
              },
              {
                step: "2",
                title: "AI generates your course",
                description:
                  "Our AI creates a complete learning path with chapters, interactive content, and quizzes tailored to you.",
                color: "pink",
              },
              {
                step: "3",
                title: "Learn interactively",
                description:
                  "Study with dynamic visualizations, take quizzes, and ask questions to your AI tutor anytime.",
                color: "blue",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className={`size-16 rounded-full bg-[var(--pastel-${item.color})] flex items-center justify-center mx-auto mb-6`}
                >
                  <span className="text-2xl font-bold text-[var(--accent-${item.color})]">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-[var(--foreground-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-y bg-white">
        <div className="content-grid">
          <CardPastel
            variant="lilac"
            className="text-center py-16 px-8 md:px-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform how you learn?
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-xl mx-auto mb-8">
              Join thousands of learners creating personalized AI courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="xl" className="gap-2">
                  Create your first course
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </CardPastel>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="content-grid">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-[var(--accent-lilac)] to-[var(--accent-pink)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-bold text-lg">Uxie</span>
            </div>

            <p className="text-sm text-[var(--foreground-muted)]">
              © 2025 Uxie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
