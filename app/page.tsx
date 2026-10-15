import type { Metadata } from "next";
import HomeClient from "@/components/home-client";

export const metadata: Metadata = {
  title: "Interactive Route Planner",
  description:
    "Compare the shortest walking route with a shade-aware CoolRoute. Adjust time of day, shade, heat budget, step-free access and closures.",
  keywords: ["route planner", "shade map", "heat budget", "walking route", "step-free route"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "CoolRoute Interactive Planner",
    description: "Shortest route vs. cooler route, with the trade-offs shown.",
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function Home() {
  return <HomeClient />;
}