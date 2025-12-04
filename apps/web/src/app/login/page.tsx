"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-[#F7F7F7] dark:from-black dark:via-black dark:to-[#252525] bg-grid-pattern p-6 md:p-10">
      <div className="w-full max-w-[420px]">
        <div className={cn("flex flex-col gap-6 w-full")}>
          <Card className="glass w-full border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-semibold">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-sm">
                Masuk ke akun Anda untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email" className="text-sm font-medium">
                      Email
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      className="bg-muted transition-all duration-150 focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel
                        htmlFor="password"
                        className="text-sm font-medium"
                      >
                        Password
                      </FieldLabel>
                      <Link
                        href="#"
                        className="ml-auto text-xs font-medium text-primary transition-all duration-150 hover:text-primary/80 hover:underline"
                      >
                        Lupa password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        className="bg-muted pr-10 transition-all duration-150 focus:border-primary focus:ring-primary/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary transition-all duration-150 hover:scale-110 hover:text-primary/80"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-none!"
                    >
                      Masuk
                    </Button>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    atau lanjutkan dengan email
                  </FieldSeparator>
                  <Field>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-border bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-border transition-none!"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Lanjutkan dengan Google
                    </Button>
                  </Field>
                  <FieldDescription className="px-0 text-center text-sm font-medium text-muted-foreground">
                    Belum punya akun?{" "}
                    <Link
                      href="/signup"
                      className="text-primary transition-all duration-150 hover:text-primary/80 hover:underline"
                    >
                      Daftar sekarang
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
