import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CoolRoute: Pedestrian Routing with Shade and Heat-Exposure Budgets",
    template: "%s | CoolRoute",
  },
  description:
    "Plan walking routes that account for shade, solar angle, slope effort and crossing waits, and see when a cooler route costs too much extra distance.",
  keywords: ["pedestrian routing", "shade", "heat exposure", "walking", "urban heat", "accessibility", "step-free"],
  applicationName: "CoolRoute",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "CoolRoute",
    title: "CoolRoute: Walk in the living shade",
    description: "Pedestrian routing with shade and heat-exposure budgets.",
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
