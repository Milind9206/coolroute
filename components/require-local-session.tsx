"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getLocalSession } from "@/lib/local-auth";
import { useLanguage } from "@/components/language-provider";

export default function RequireLocalSession({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    getLocalSession().then((session) => {
      if (!active) return;
      if (!session) {
        const next = `${window.location.pathname}${window.location.search}`;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setReady(true);
    }).catch(() => {
      if (active) router.replace(`/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
    });
    return () => { active = false; };
  }, [router]);

  if (!ready) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">{t("Opening CoolRoute…")}</main>;
  return children;
}
