import type { Metadata } from "next";
import AuthPage from "@/components/auth-page";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in or create a local CoolRoute account to plan your next walk.",
  robots: { index: false, follow: false },
};

export default function Home() {
  return <AuthPage mode="login" />;
}
