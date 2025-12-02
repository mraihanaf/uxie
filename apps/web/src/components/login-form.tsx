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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
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
                  className="w-full bg-primary text-primary-foreground transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
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
                  className="w-full border-border bg-secondary text-secondary-foreground transition-all duration-150 hover:bg-secondary/80 hover:border-primary hover:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="mr-2 h-5 w-5"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Lanjutkan dengan Google
                </Button>
              </Field>
              <FieldDescription className="px-0 text-center text-xs leading-relaxed text-muted-foreground">
                Dengan melanjutkan, Anda menyetujui{" "}
                <Link href="#" className="text-primary hover:underline">
                  Syarat Layanan
                </Link>{" "}
                dan{" "}
                <Link href="#" className="text-primary hover:underline">
                  Kebijakan Privasi
                </Link>
                .
              </FieldDescription>
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
  );
}
