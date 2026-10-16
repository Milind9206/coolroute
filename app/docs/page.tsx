import type { Metadata } from "next";
import DocsContent from "@/components/docs-content";

export const metadata: Metadata = {
  title: "Math & Graph Architecture",
  description:
    "How CoolRoute models streets as a graph, computes solar shade, walking effort and heat exposure, and solves the heat-budget constrained shortest path.",
  keywords: ["Tobler hiking function", "constrained Dijkstra", "solar geometry", "heat exposure", "resource-constrained shortest path"],
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "CoolRoute: Math & Graph Architecture",
    description: "The models behind shade-aware, budget-constrained walking routes.",
    url: "/docs",
  },
  robots: { index: true, follow: true },
};

export default function DocsPage() {
  return <DocsContent />;
}
