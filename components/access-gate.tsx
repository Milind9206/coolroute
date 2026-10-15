"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEMO_ACCESS_KEY } from "@/lib/demo-access";

const PUBLIC_PATHS = new Set(["/login", "/signup"]);

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const [ready, setReady] = React.useState(false);
  const [hasAccess, setHasAccess] = React.useState(false);

  React.useEffect(() => {
    const granted = window.sessionStorage.getItem(DEMO_ACCESS_KEY) === "granted";
    setHasAccess(granted);
    setReady(true);
    if (!granted && !PUBLIC_PATHS.has(pathname)) router.replace("/login");
  }, [pathname, router]);

  if (isPublicPath) return children;
  if (!ready || !hasAccess) {
    return <main className="min-h-svh bg-[#07100d]" aria-busy="true" aria-label="Checking access" />;
  }
  return children;
}
