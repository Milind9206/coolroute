import Image from "next/image";
import Link from "next/link";
import { marketingContent } from "@/lib/marketing-content";

export function SiteFooter() {
  const footer = marketingContent.footer;
  return <footer id="footer" className="bg-[#F8FAFA] text-[#0B3B4F]">
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_2fr] md:py-16 lg:grid-cols-[1.7fr_2.3fr] lg:px-10">
      <div className="max-w-sm">
        <Link href="/" aria-label="CoolRoute home" className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E8E]"><Image src="/coolroute-logo.svg" alt="CoolRoute" width={180} height={45} className="marketing-logo h-9 w-auto" /></Link>
        <p className="mt-5 text-sm leading-6 text-[#0B3B4F]/65">{footer.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {footer.groups.map((group) => <div key={group.title}>
          <h2 className="text-sm font-semibold text-[#0B3B4F]">{group.title}</h2>
          <ul className="mt-4 space-y-3">
            {group.links.map((link) => <li key={link.label}><a href={link.href} className="text-sm text-[#0B3B4F]/65 transition hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E8E]">{link.label}</a></li>)}
          </ul>
        </div>)}
      </div>
      <div className="border-t border-[#0B3B4F]/10 pt-6 text-xs leading-5 text-[#0B3B4F]/50 md:col-span-2">
        <div className="grid gap-1 sm:grid-cols-2">{footer.legalNotes.map((note) => <p id={note.id} key={note.id}><span className="font-semibold">{note.label}:</span> {note.text}</p>)}</div>
        <div className="mt-3 flex flex-col justify-between gap-2 sm:flex-row"><p>© {new Date().getFullYear()} CoolRoute. All rights reserved.</p><p>Made for the walk ahead.</p></div>
      </div>
    </div>
  </footer>;
}
