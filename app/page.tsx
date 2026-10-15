import type { Metadata } from "next";
import HomeClient from "@/components/home-client";

export const metadata: Metadata = {
  title: "A Cooler Way to Get There",
  description:
    "Plan a walking route around shade, sunlight and your comfort.",
  keywords: ["route planner", "shade map", "heat budget", "walking route", "step-free route"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "CoolRoute — A Cooler Way to Get There",
    description: "Plan a walking route around shade and sunlight.",
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function Home() {
  return <HomeClient />;
}
