import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern p-6 md:p-10">
      <div className="w-full max-w-[480px]">
        <SignupForm />
      </div>
    </div>
  );
}
