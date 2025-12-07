"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrimaryButton } from "@/components/button";
import { FeatureCard } from "@/components/card";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern">
      <section className="container mx-auto px-5 py-8 md:px-8 md:py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Pantau progres belajar Anda dengan visualisasi data real-time.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/dashboard/course-creation">
            <FeatureCard
              icon={<Plus className="h-12 w-12" />}
              title="Buat Kursus Baru"
              description="Upload materi dan buat kursus pembelajaran baru dengan AI"
              iconColor="text-primary"
              hoverBorderColor="hover:border-primary"
              className="cursor-pointer h-full"
            />
          </Link>

          <Link href="/dashboard/course-dashboard">
            <FeatureCard
              icon={<BookOpen className="h-12 w-12" />}
              title="Lihat Kursus"
              description="Akses semua kursus Anda dan lanjutkan pembelajaran"
              iconColor="text-accent"
              hoverBorderColor="hover:border-accent"
              className="cursor-pointer h-full"
            />
          </Link>

          <Link href="/dashboard/study-view/1">
            <FeatureCard
              icon={<GraduationCap className="h-12 w-12" />}
              title="Mulai Belajar"
              description="Lanjutkan pembelajaran dari bab terakhir yang Anda baca"
              iconColor="text-[#E88B9E]"
              hoverBorderColor="hover:border-[#E88B9E]"
              className="cursor-pointer h-full"
            />
          </Link>
        </div>

        {/* Quick Stats */}
        <Card className="glass-sm border border-border/60 shadow-md">
          <CardHeader>
            <CardTitle>Ringkasan Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Mulai dengan membuat kursus baru atau lanjutkan pembelajaran yang
              sudah ada.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
