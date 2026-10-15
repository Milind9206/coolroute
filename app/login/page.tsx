import type { Metadata } from "next";
import AuthPanel from "@/components/auth-panel";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to CoolRoute to plan more comfortable walks.",
};

export default function LoginPage() {
  return <AuthPanel mode="login" />;
}

