import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Footprints } from "lucide-react";

export const metadata: Metadata = {
  title: "Error 404: Footpath Closed or Unmapped Segment",
  description: "This footpath is closed or this segment is not on the map.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Footprints className="h-12 w-12 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Error 404 • Footpath Closed or Unmapped Segment
      </p>
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
        This route doesn&apos;t lead anywhere.
      </h1>
      <p className="max-w-md text-muted-foreground">
        The page you wanted is either closed for the day or was never mapped. Let&apos;s reroute you.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Back to planner <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-muted"
        >
          Math &amp; proofs
        </Link>
      </div>
    </main>
  );
}