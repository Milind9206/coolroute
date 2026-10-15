"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, MapPin } from "lucide-react";

type AuthMode = "login" | "signup";

export default function AuthPanel({ mode }: { mode: AuthMode }) {
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = React.useState(false);
  const [notice, setNotice] = React.useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(true);
  }

  return (
    <main className="min-h-svh bg-[#07100d] text-white lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-svh flex-col justify-between overflow-hidden border-r border-white/10 px-12 py-10 lg:flex xl:px-20">
        <div aria-hidden className="absolute -left-32 top-1/4 h-[30rem] w-[30rem] rounded-full bg-emerald-400/10 blur-[100px]" />
        <div aria-hidden className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-teal-300/10 blur-[110px]" />

        <Link href="/" className="relative z-10 inline-flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300 text-[#07100d]"><MapPin className="h-5 w-5" /></span>
          CoolRoute
        </Link>

        <div className="relative z-10 max-w-xl py-16">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">A cooler way across town</p>
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight xl:text-6xl">Find the route that feels better.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">Plan your walk around shade, sun and step-free streets with CoolRoute.</p>

          <div className="relative mt-14 flex h-48 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div aria-hidden className="absolute inset-x-8 top-1/2 h-px -rotate-[13deg] bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
            <div aria-hidden className="absolute inset-x-16 top-1/2 h-px rotate-[18deg] bg-gradient-to-r from-transparent via-teal-200/50 to-transparent" />
            <span className="relative rounded-full border border-emerald-200/40 bg-emerald-300/10 px-5 py-3 text-sm font-medium text-emerald-100 shadow-[0_0_50px_rgba(110,231,183,0.15)]">Walk in the living shade</span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/40">CoolRoute · Walk in the living shade</p>
      </section>

      <section className="flex min-h-svh items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white lg:hidden">
            <MapPin className="h-4 w-4 text-emerald-300" /> CoolRoute
          </Link>
          <Link href="/" className="mb-8 hidden items-center gap-2 text-sm text-white/50 transition hover:text-white sm:inline-flex">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 sm:p-9">
            <p className="text-sm font-medium text-emerald-300">{isSignup ? "Start your journey" : "Welcome back"}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{isSignup ? "Create an account" : "Log in to CoolRoute"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{isSignup ? "Save your preferences and plan a more comfortable walk." : "Pick up where you left off and plan your next walk."}</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {isSignup && (
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-sm font-medium text-white/85">Full name</label>
                  <input id="full-name" name="name" autoComplete="name" required className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition placeholder:text-white/30 focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/15" placeholder="Your name" />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/85">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition placeholder:text-white/30 focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/15" placeholder="you@example.com" />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white/85">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} required className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 text-sm outline-none transition placeholder:text-white/30 focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/15" placeholder={isSignup ? "At least 8 characters" : "Enter your password"} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/45 transition hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="h-12 w-full rounded-xl bg-emerald-300 px-4 text-sm font-semibold text-[#07100d] transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07100d]">
                {isSignup ? "Create account" : "Log in"}
              </button>

              {notice && <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-200/5 px-4 py-3 text-sm leading-relaxed text-amber-100/80">These forms are a UI preview. Account sign-in is not connected yet.</p>}
            </form>

            <p className="mt-7 text-center text-sm text-white/55">
              {isSignup ? "Already have an account? " : "New to CoolRoute? "}
              <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-emerald-300 transition hover:text-emerald-200">{isSignup ? "Log in" : "Create an account"}</Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-white/35">Your routes are estimates based on simplified street and shade data.</p>
        </div>
      </section>
    </main>
  );
}

