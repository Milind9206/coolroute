"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import ReportIssueToggle from "@/components/report-issue-toggle";
import { marketingContent } from "@/lib/marketing-content";

export function SiteNav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${scrolled ? "border-[#0B3B4F]/10 bg-[#F8FAFA]/90 shadow-[0_8px_30px_rgba(11,59,79,0.05)] backdrop-blur-xl" : "border-transparent bg-[#F8FAFA]/70 backdrop-blur-md"}`}>
    <nav aria-label="Main navigation" className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
      <Link href="/" className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E8E]" aria-label="CoolRoute home">
        <Image src="/coolroute-logo.svg" alt="CoolRoute" width={180} height={45} priority loading="eager" className="marketing-logo h-8 w-auto max-w-[132px] md:h-9 md:max-w-none" />
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        {marketingContent.nav.map((item) => <a key={item.href} href={item.href} className="text-sm font-medium text-[#0B3B4F]/72 transition hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E8E]">{item.label}</a>)}
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <ReportIssueToggle />
        <Link href="/planner" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0F766E] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0B625C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F9E8E]/30">
          Try CoolRoute <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <Link href="/planner" className="inline-flex min-h-10 items-center rounded-full bg-[#0F766E] px-4 text-sm font-semibold text-white">Try CoolRoute</Link>
        <button type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-full border border-[#0B3B4F]/15 text-[#0B3B4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E8E]">
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </nav>
    {menuOpen && <div id="mobile-navigation" className="border-t border-[#0B3B4F]/10 bg-[#F8FAFA] px-5 pb-5 pt-3 md:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-1">
        {marketingContent.nav.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-[#0B3B4F] hover:bg-[#0F9E8E]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E8E]">{item.label}</a>)}
        <div className="mt-2 border-t border-[#0B3B4F]/10 pt-3"><ReportIssueToggle /></div>
      </div>
    </div>}
  </header>;
}
