import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CoolRoutePlanner from "@/components/cool-route-planner";
import ThemeToggle from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Route Planner",
  description:
    "Compare walking routes with shade, sunlight and heat exposure in mind.",
  alternates: { canonical: "/planner" },
};

export default function PlannerPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8 md:py-6">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 rounded-full px-3 text-base font-semibold tracking-tight transition hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          CoolRoute
          <span className="sr-only"> — back to home</span>
        </Link>
        <ThemeToggle />
      </header>
      <CoolRoutePlanner />
    </main>
  );
}
