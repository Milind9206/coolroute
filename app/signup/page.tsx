import type { Metadata } from "next";
import AuthPanel from "@/components/auth-panel";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a CoolRoute account and plan a more comfortable walk.",
};

export default function SignupPage() {
  return <AuthPanel mode="signup" />;
}

