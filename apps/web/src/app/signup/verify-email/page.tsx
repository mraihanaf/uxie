"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-[var(--accent-lilac)] to-[var(--accent-pink)] flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">Uxie</span>
          </Link>
        </div>

        <Card className="border-0 shadow-floating text-center">
          <CardHeader className="pb-2">
            <div className="mx-auto size-16 rounded-full bg-[var(--pastel-lilac)] flex items-center justify-center mb-4">
              <Mail className="size-8 text-[var(--accent-lilac)]" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent a verification link to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="font-medium text-lg">{email}</p>

            <p className="text-sm text-[var(--foreground-secondary)]">
              Click the link in the email to verify your account and start
              learning.
            </p>

            <div className="pt-4 space-y-3">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Back to login
                </Button>
              </Link>

              <p className="text-xs text-[var(--foreground-muted)]">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <Link
                  href="/signup"
                  className="text-[var(--accent-lilac)] hover:underline"
                >
                  try again
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
