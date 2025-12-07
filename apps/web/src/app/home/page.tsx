"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern">
      {/* Hero Section */}
      <section className="flex min-h-screen items-center justify-center px-5 py-8 md:px-8 md:py-12">
        <Card className="glass max-w-[600px] w-full border-border/50 shadow-lg">
          <CardContent className="p-12 md:p-12 sm:p-6">
            <h1 className="mb-4 text-center text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-[42px]">
              {t("hero.title")}
            </h1>
            <p className="mb-8 text-center text-lg leading-relaxed text-muted-foreground">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                className="bg-primary text-primary-foreground transition-all duration-150 hover:scale-105 hover:shadow-lg active:scale-[0.98]"
              >
                <Link href="/login">{t("hero.cta_primary")}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary bg-secondary text-secondary-foreground transition-all duration-150 hover:bg-secondary/80 hover:text-primary hover:border-primary/80 sm:ml-4"
              >
                <Link href="/about">{t("hero.cta_secondary")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
