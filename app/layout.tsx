import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";

const inter = localFont({ src: "../public/fonts/inter-latin.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });
const poppins = localFont({
  src: [
    { path: "../public/fonts/poppins-400-latin.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/poppins-500-latin.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/poppins-600-latin.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/poppins-700-latin.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = process.env.SITE_URL ?? "https://coolroute-chi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CoolRoute | Walk in the shade",
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
    title: "CoolRoute | Walk in the shade",
    description: "Compare walking routes by time and modeled sun exposure.",
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <LanguageProvider><ThemeProvider>{children}</ThemeProvider></LanguageProvider>
      </body>
    </html>
  );
}
