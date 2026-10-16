"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Moon, Sun } from "lucide-react";
import { getLocalSession, signInLocal, signUpLocal } from "@/lib/local-auth";
import { useLanguage } from "@/components/language-provider";
import LanguageToggle from "@/components/language-toggle";

type AuthPageProps = { mode: "login" | "signup" };

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/login") && !value.startsWith("/signup")
    ? value
    : "/welcome";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = React.useState(false);
  const [destination, setDestination] = React.useState("/welcome");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const signup = mode === "signup";

  React.useEffect(() => {
    setMounted(true);
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    setDestination(next);
    if (getLocalSession()) router.replace(next);
  }, [router]);

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const switchHref = `${signup ? "/login" : "/signup"}?next=${encodeURIComponent(destination)}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (signup) await signUpLocal(name, email, password);
      else await signInLocal(email, password);
      router.push(destination);
    } catch (reason) {
      setError(t(reason instanceof Error ? reason.message : "We couldn't complete that request."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 transition-colors duration-1000 ${isDark ? "bg-[#07100d] text-white" : "bg-[#f3f1ea] text-[#10201a]"}`}>
      <div aria-hidden className={`pointer-events-none absolute -left-36 -top-44 h-[32rem] w-[32rem] rounded-full blur-3xl transition-all duration-[1600ms] ${isDark ? "bg-emerald-400/15" : "bg-emerald-300/45"}`} />
      <div aria-hidden className={`pointer-events-none absolute -bottom-48 -right-40 h-[34rem] w-[34rem] rounded-full blur-3xl transition-all duration-[1600ms] ${isDark ? "bg-teal-600/15" : "bg-lime-300/35"}`} />

      <div className="absolute right-5 top-5 flex items-center gap-3 md:right-8 md:top-8">
        <span className={`hidden text-sm sm:block ${isDark ? "text-white/60" : "text-black/55"}`}>{t(signup ? "Already walking with us?" : "New to CoolRoute?")}</span>
        <Link href={switchHref} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-700 ${isDark ? "border-white/20 hover:bg-white/10" : "border-black/15 hover:bg-black/5"}`}>
          {t(signup ? "Log in" : "Sign up")}
        </Link>
        <LanguageToggle compact />
        <button onClick={toggleTheme} type="button" aria-label={t(isDark ? "Switch to light mode" : "Switch to dark mode")} className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-700 hover:rotate-12 ${isDark ? "border-white/20 hover:bg-white/10" : "border-black/15 hover:bg-black/5"}`}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <div className={`relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border shadow-2xl transition-all duration-1000 md:grid-cols-[1.05fr_0.95fr] ${isDark ? "border-white/10 bg-[#0c1713]/85 shadow-black/30" : "border-white/70 bg-white/75 shadow-emerald-950/10"}`}>
        <section className="relative hidden min-h-[38rem] flex-col justify-between overflow-hidden p-10 md:flex lg:p-14">
          <div aria-hidden className={`absolute inset-0 transition-colors duration-1000 ${isDark ? "bg-gradient-to-br from-emerald-950/80 via-[#0d211a] to-[#07100d]" : "bg-gradient-to-br from-emerald-100 via-[#e8f0dc] to-[#f3f1ea]"}`} />
          <div aria-hidden className={`absolute -right-24 top-24 h-80 w-80 rounded-full border-[1px] transition-all duration-[1600ms] ${isDark ? "scale-100 border-emerald-300/25" : "scale-110 border-emerald-800/15"}`} />
          <div aria-hidden className={`absolute -right-12 top-36 h-56 w-56 rounded-full border-[1px] transition-all duration-[1600ms] ${isDark ? "scale-100 border-emerald-300/20" : "scale-110 border-emerald-800/10"}`} />
          <div className="relative flex items-center gap-3 text-lg font-semibold"><Image src="/coolroute-language-logo.jpeg" width={38} height={38} alt="" className={`h-9 w-9 object-contain ${isDark ? "grayscale invert contrast-[5] mix-blend-screen" : "grayscale contrast-[5] mix-blend-multiply"}`} /> CoolRoute</div>
          <div className="relative max-w-md">
            <p className={`mb-5 text-sm font-semibold uppercase tracking-[0.22em] transition-colors duration-1000 ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>{t("Take the cooler way")}</p>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight lg:text-6xl">{t("A little more shade.")}<br />{t("A better way there.")}</h1>
            <p className={`mt-6 max-w-sm text-lg leading-relaxed transition-colors duration-1000 ${isDark ? "text-white/65" : "text-black/60"}`}>{t("Plan a walk around shade, sunlight and your comfort.")}</p>
          </div>
          <div className={`relative flex items-center gap-2 text-sm transition-colors duration-1000 ${isDark ? "text-white/45" : "text-black/45"}`}><span className="h-2 w-2 rounded-full bg-emerald-400" /> {t("Built for the walk ahead")}</div>
        </section>

        <section className="flex min-h-[38rem] flex-col justify-center px-7 py-14 sm:px-12 md:px-10 lg:px-14">
          <div className="mb-8 md:hidden"><p className="flex items-center gap-2 text-lg font-semibold"><Image src="/coolroute-language-logo.jpeg" width={30} height={30} alt="" className={`h-7 w-7 object-contain ${isDark ? "grayscale invert contrast-[5] mix-blend-screen" : "grayscale contrast-[5] mix-blend-multiply"}`} />CoolRoute</p></div>
          <div className="mb-8">
            <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>{t(signup ? "Create your account" : "Welcome back")}</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t(signup ? "Find your way in." : "Let’s get there.")}</h2>
            <p className={`mt-3 text-base ${isDark ? "text-white/60" : "text-black/55"}`}>{t(signup ? "A cooler walk starts with a few details." : "Sign in to plan your next walk.")}</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {signup && <label className="block space-y-2 text-sm font-medium">{t("Your name")}
              <span className={`mt-2 flex items-center gap-3 rounded-xl border px-4 transition-colors focus-within:border-emerald-500 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white/70"}`}><input autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Alex Morgan")} className="h-12 w-full bg-transparent outline-none placeholder:text-muted-foreground" /></span>
            </label>}
            <label className="block space-y-2 text-sm font-medium">{t("Email address")}
              <span className={`mt-2 flex items-center gap-3 rounded-xl border px-4 transition-colors focus-within:border-emerald-500 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white/70"}`}><Mail className={`h-4 w-4 shrink-0 ${isDark ? "text-white/40" : "text-black/40"}`} /><input autoComplete="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 w-full bg-transparent outline-none placeholder:text-muted-foreground" /></span>
            </label>
            <label className="block space-y-2 text-sm font-medium">{t("Password")}
              <span className={`mt-2 flex items-center gap-3 rounded-xl border px-4 transition-colors focus-within:border-emerald-500 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white/70"}`}><LockKeyhole className={`h-4 w-4 shrink-0 ${isDark ? "text-white/40" : "text-black/40"}`} /><input autoComplete={signup ? "new-password" : "current-password"} required type={showPassword ? "text" : "password"} minLength={signup ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t(signup ? "At least 8 characters" : "Enter your password")} className="h-12 w-full bg-transparent outline-none placeholder:text-muted-foreground" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={t(showPassword ? "Hide password" : "Show password")} className="text-muted-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
            </label>
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={busy} className={`group flex min-h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all duration-500 hover:gap-4 disabled:cursor-wait disabled:opacity-60 ${isDark ? "bg-emerald-300 text-[#07100d] hover:bg-emerald-200" : "bg-emerald-800 text-white hover:bg-emerald-700"}`}>
              {t(busy ? "Please wait…" : signup ? "Create account" : "Sign in")} {!busy && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
          <p className={`mt-7 text-center text-xs leading-relaxed ${isDark ? "text-white/40" : "text-black/45"}`}>{t("Local prototype access: accounts stay in this browser. Don’t reuse a password from another service.")}</p>
          <p className={`mt-5 text-center text-sm sm:hidden ${isDark ? "text-white/55" : "text-black/55"}`}>
            {t(signup ? "Already have an account? " : "New here? ")}<Link className="font-semibold text-emerald-500" href={switchHref}>{t(signup ? "Log in" : "Sign up")}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
