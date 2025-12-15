"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { useUser } from "@/hooks/use-user";
import { signOut } from "@/lib/supabase/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-dashboard)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative size-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-[var(--pastel-lilac)] rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[var(--accent-lilac)] rounded-full animate-spin" />
          </div>
          <p className="text-[var(--foreground-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      user={{
        name: user?.user_metadata?.full_name,
        email: user?.email,
        avatar: user?.user_metadata?.avatar_url,
      }}
      onSignOut={handleSignOut}
    >
      {children}
    </AppShell>
  );
}
