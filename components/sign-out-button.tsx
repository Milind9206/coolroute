"use client";

import { useRouter } from "next/navigation";
import { signOutLocal } from "@/lib/local-auth";
import { useLanguage } from "@/components/language-provider";

export default function SignOutButton() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={async () => { await signOutLocal().catch(() => undefined); router.replace("/"); }}
      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
    >
      {t("Sign out")}
    </button>
  );
}
