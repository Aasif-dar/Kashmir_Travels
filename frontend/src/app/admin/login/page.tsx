"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { adminLogin, DEMO_ADMIN } from "@/services/admin-auth";

const schema = z.object({ email: z.string().trim().email("Enter a valid email"), password: z.string().min(1, "Enter the password") });
type Values = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(({ email, password }) => {
    if (adminLogin(email, password)) router.replace("/admin");
    else setError("That email or password isn't right for the demo account.");
  });

  return (
    <main className="grid min-h-dvh place-items-center bg-forest px-4 py-12">
      <div className="w-full max-w-md bg-ivory p-8 sm:p-10">
        <Logo />
        <h1 className="mt-8 font-display text-4xl">Admin sign-in</h1>
        <p className="mt-2 flex items-start gap-2 border border-burgundy/30 bg-burgundy/[0.05] px-3 py-2.5 text-[13px] leading-snug text-burgundy">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Demo only — this is mock authentication, not real security. Replace it before launch.
        </p>
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5" aria-label="Admin sign in">
          <Field label="Email" htmlFor="a-email" error={errors.email?.message}><Input id="a-email" type="email" autoComplete="username" aria-invalid={!!errors.email} {...register("email")} /></Field>
          <Field label="Password" htmlFor="a-pass" error={errors.password?.message}><Input id="a-pass" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} /></Field>
          {error && <p role="alert" className="text-sm text-burgundy">{error}</p>}
          <Button type="submit" size="lg" className="w-full">Sign in</Button>
        </form>
        <div className="mt-6 border-t border-line pt-4 text-[13px] text-muted">
          <p className="font-semibold text-forest">Demo credentials</p>
          <p>Email: <code className="text-ink">{DEMO_ADMIN.email}</code></p>
          <p>Password: <code className="text-ink">{DEMO_ADMIN.password}</code></p>
        </div>
      </div>
    </main>
  );
}
