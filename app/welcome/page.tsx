import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import RequireLocalSession from "@/components/require-local-session";

export const metadata: Metadata = {
  title: "A Cooler Way to Get There",
  description: "Plan a walking route around shade, sunlight and your comfort.",
  alternates: { canonical: "/welcome" },
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return <RequireLocalSession><HomeClient /></RequireLocalSession>;
}
