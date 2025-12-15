"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { AuthShell } from "@/components/layout";
import { signUp, signInWithGoogle } from "@/lib/supabase/auth";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await signUp(data.email, data.password, data.name);

      // If email confirmation is required
      if (result.user && !result.session) {
        router.push(
          "/signup/verify-email?email=" + encodeURIComponent(data.email),
        );
      } else {
        // Use window.location for full page reload so middleware can see cookies
        window.location.href = "/app";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(undefined);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign up with Google.",
      );
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <SignupForm
        onSubmit={handleSubmit}
        onGoogleSignup={handleGoogleSignup}
        error={error}
        loading={loading}
      />
    </AuthShell>
  );
}
