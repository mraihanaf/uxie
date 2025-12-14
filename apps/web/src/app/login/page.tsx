"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { AuthShell } from "@/components/layout";
import { signIn, signInWithGoogle } from "@/lib/supabase/auth";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/app";

  const handleSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(undefined);

    try {
      await signIn(data.email, data.password);
      // Use window.location for full page reload so middleware can see cookies
      window.location.href = redirect;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again.",
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(undefined);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Google.",
      );
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        error={error}
        loading={loading}
      />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell>
          <LoginForm
            onSubmit={async () => {}}
            onGoogleLogin={async () => {}}
            error={undefined}
            loading={true}
          />
        </AuthShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
