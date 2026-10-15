"use client";

import { useRouter } from "next/navigation";
import { signOutLocal } from "@/lib/local-auth";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => { signOutLocal(); router.replace("/"); }}
      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
    >
      Sign out
    </button>
  );
}
