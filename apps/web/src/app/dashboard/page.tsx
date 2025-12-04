import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern">
      <section className="flex min-h-screen items-center justify-center px-5 py-8 md:px-8 md:py-12">
        <Card className="glass max-w-[800px] w-full border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl md:text-4xl font-semibold">
              Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg leading-relaxed text-muted-foreground">
              Pantau progres belajar Anda dengan visualisasi data real-time.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
