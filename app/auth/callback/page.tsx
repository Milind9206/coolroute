"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import ReportIssueToggle from "@/components/report-issue-toggle";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [message, setMessage] = React.useState(t("Confirming your email…"));

  React.useEffect(() => {
    let active = true;
    const finish = async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const authError = params.get("error_description") || params.get("error");
      window.history.replaceState({}, document.title, window.location.pathname);

      if (authError) {
        if (active) setMessage(t("That confirmation link expired or was already used. Request a new confirmation email and try again."));
        return;
      }
      if (!accessToken || !refreshToken) {
        if (active) setMessage(t("The confirmation link did not include a session. Request a new confirmation email and try again."));
        return;
      }

      try {
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
          cache: "no-store",
        });
        const result = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(result.error || "We couldn't confirm your email.");
        router.replace("/welcome");
      } catch (error) {
        if (active) setMessage(error instanceof Error ? t(error.message) : t("We couldn't confirm your email."));
      }
    };
    void finish();
    return () => { active = false; };
  }, [router, t]);

  return <main className="relative flex min-h-screen items-center justify-center bg-[#07100d] px-6 text-center text-white"><div className="absolute right-6 top-6"><ReportIssueToggle /></div><div className="max-w-lg"><p role="status" className="text-lg">{message}</p><a href="/login?next=%2Fplanner" className="mt-6 inline-flex text-emerald-300 underline underline-offset-4">{t("Go to sign in")}</a></div></main>;
}
