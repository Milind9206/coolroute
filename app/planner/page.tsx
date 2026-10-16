import type { Metadata } from "next";
import CoolRoutePlanner from "@/components/cool-route-planner";
import ThemeToggle from "@/components/theme-toggle";
import RequireLocalSession from "@/components/require-local-session";
import SignOutButton from "@/components/sign-out-button";
import LanguageToggle from "@/components/language-toggle";
import PlannerHomeLink from "@/components/planner-home-link";
import ReportIssueToggle from "@/components/report-issue-toggle";

export const metadata: Metadata = {
  title: "Route Planner",
  description:
    "Compare walking routes with shade, sunlight and heat exposure in mind.",
  alternates: { canonical: "/planner" },
};

export default function PlannerPage() {
  return (
    <RequireLocalSession>
      <main className="min-h-screen">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8 md:py-6">
          <PlannerHomeLink />
          <div className="flex items-center gap-1">
            <ReportIssueToggle />
            <SignOutButton />
            <LanguageToggle compact />
            <ThemeToggle />
          </div>
        </header>
        <CoolRoutePlanner />
      </main>
    </RequireLocalSession>
  );
}
