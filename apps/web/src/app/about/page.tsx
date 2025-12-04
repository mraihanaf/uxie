import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern">
      <section className="flex min-h-screen items-center justify-center px-5 py-8 md:px-8 md:py-12">
        <Card className="glass max-w-[800px] w-full border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl md:text-4xl font-semibold">
              Tentang Uxie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-lg leading-relaxed text-muted-foreground">
              Uxie adalah platform pendidikan futuristik yang dirancang untuk
              memberikan pengalaman belajar terbaik.
            </p>
            <p className="text-center text-base leading-relaxed text-muted-foreground">
              Kami berkomitmen untuk menghadirkan konten pembelajaran
              berkualitas tinggi dari instruktur terbaik di bidangnya.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
