import type { Metadata } from "next";
import MarketingSite from "@/components/marketing-site";

export const metadata: Metadata = {
  title: "Walk in the shade. Plan a cooler route | CoolRoute",
  description: "CoolRoute helps you compare walking routes by time and modeled sun exposure, so you can choose a path that feels more comfortable.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "CoolRoute",
    title: "Walk in the shade. Plan a cooler route | CoolRoute",
    description: "Compare walking routes by time and modeled sun exposure.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Walk in the shade. Plan a cooler route | CoolRoute",
    description: "Compare walking routes by time and modeled sun exposure.",
  },
};

export default function Home() {
  return <MarketingSite />;
}
