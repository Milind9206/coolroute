import Link from "next/link";
import { ArrowRight, ArrowUpRight, Smartphone, SlidersHorizontal, Sun, ThermometerSun, Trees, Waypoints } from "lucide-react";
import { marketingContent } from "@/lib/marketing-content";
import { SiteNav } from "@/components/marketing/site-nav";
import { RouteIllustration } from "@/components/marketing/route-illustration";
import { RouteComparison } from "@/components/marketing/route-comparison";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Reveal } from "@/components/marketing/reveal";
import { ParticleBrandLogo } from "@/components/marketing/particle-brand-logo";
import { ParticleStory } from "@/components/marketing/particle-story";

const iconMap = {
  route: Waypoints,
  heat: ThermometerSun,
  sun: Sun,
  trees: Trees,
  slider: SlidersHorizontal,
  phone: Smartphone,
} as const;

export default function MarketingSite() {
  const content = marketingContent;
  return <div className="marketing-page min-h-screen overflow-x-clip bg-[#F8FAFA] text-[#0B3B4F]">
    <SiteNav />
    <div className="border-b border-[#0F9E8E]/10 bg-[#E7F7F2] px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-[#0B665E] sm:text-sm">
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#0F9E8E] align-middle" aria-hidden="true" />{content.announcement}
    </div>

    <main>
      <ParticleStory description={content.hero.description} primary={content.hero.primary} secondary={content.hero.secondary} />
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16 md:pb-20 lg:px-10">
        <Reveal className="relative z-10 mx-auto max-w-3xl">
          <RouteIllustration />
          <p className="mt-4 text-center text-[11px] leading-5 text-[#0B3B4F]/50">A visual concept for an example walk. Route and exposure figures are illustrative.</p>
        </Reveal>
      </section>

      <section aria-label="Illustrative route sample data" className="border-y border-[#0B3B4F]/8 bg-white/70">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F766E]">A sample route, side by side</p><p className="text-xs text-[#0B3B4F]/50">Illustrative figures only · not live city data</p></div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-6">
            {content.stats.map((stat, index) => <Reveal key={stat.label} delay={index * 70}><div className="border-l-2 border-[#5EEAD4] pl-4 sm:pl-5"><p className="font-heading text-3xl font-semibold tracking-tight text-[#0B3B4F] sm:text-4xl">{stat.value}</p><p className="mt-2 max-w-[190px] text-xs leading-5 text-[#0B3B4F]/60 sm:text-sm">{stat.label}</p></div></Reveal>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-10">
        <SectionIntro eyebrow={content.how.eyebrow} title={content.how.title} body={content.how.intro} />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {content.how.steps.map((step, index) => <Reveal key={step.number} delay={index * 90}><article className="group h-full rounded-[22px] border border-[#0B3B4F]/10 bg-white p-6 shadow-[0_8px_26px_rgba(11,59,79,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(11,59,79,0.09)] sm:p-7">
            <div className="flex items-center justify-between"><span className="font-heading text-sm font-semibold tracking-[0.12em] text-[#0F9E8E]">{step.number}</span><span className="h-px w-14 bg-[#0F9E8E]/30 transition-all group-hover:w-20" /></div>
            <h3 className="mt-8 font-heading text-xl font-semibold tracking-tight text-[#0B3B4F]">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#0B3B4F]/65">{step.description}</p>
          </article></Reveal>)}
        </div>
      </section>

      <section id="features" className="scroll-mt-24 border-y border-[#0B3B4F]/8 bg-[#EFF7F4]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-10">
          <SectionIntro eyebrow={content.features.eyebrow} title={content.features.title} body={content.features.intro} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.features.items.map((feature, index) => {
              const Icon = iconMap[feature.icon];
              return <Reveal key={feature.title} delay={(index % 3) * 65}><article className="group h-full rounded-[20px] border border-[#0B3B4F]/8 bg-white/85 p-6 transition duration-300 hover:-translate-y-1 hover:border-[#0F9E8E]/35 hover:bg-white hover:shadow-[0_18px_38px_rgba(11,59,79,0.08)]">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF6EF] text-[#0F766E] transition group-hover:scale-105"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span>
                <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight text-[#0B3B4F]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#0B3B4F]/65">{feature.description}</p>
              </article></Reveal>;
            })}
          </div>
        </div>
      </section>

      <BrandInterlude />

      <section id="compare" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-10">
        <SectionIntro eyebrow={content.comparison.eyebrow} title={content.comparison.title} body={content.comparison.intro} />
        <Reveal><RouteComparison /></Reveal>
      </section>

      <section aria-labelledby="testimonials-heading" className="border-y border-[#0B3B4F]/8 bg-white/65">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24 lg:px-10">
          <SectionIntro eyebrow={content.testimonials.eyebrow} title={content.testimonials.title} />
          <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
            {content.testimonials.items.map((item, index) => <Reveal key={item.quote} delay={index * 70} className="min-w-[82%] snap-center md:min-w-0"><figure className="flex h-full min-h-52 flex-col justify-between rounded-[22px] border border-[#0B3B4F]/10 bg-[#F8FAFA] p-6 sm:p-7"><blockquote className="font-heading text-lg font-medium leading-7 tracking-tight text-[#0B3B4F]">“{item.quote}”</blockquote><figcaption className="mt-7 flex items-center justify-between gap-3 text-xs text-[#0B3B4F]/55"><span>{item.byline}</span><span className="rounded-full bg-[#FDE68A]/60 px-2.5 py-1 font-medium text-[#755A17]">Placeholder</span></figcaption></figure></Reveal>)}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F766E]">{content.faq.eyebrow}</p><h2 className="mt-4 max-w-md font-heading text-4xl font-semibold leading-tight tracking-[-0.045em] text-[#0B3B4F] sm:text-5xl">{content.faq.title}</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#0B3B4F]/65">A few things to know before you plan your first CoolRoute.</p></div>
        <div className="divide-y divide-[#0B3B4F]/12 border-y border-[#0B3B4F]/12">
          {content.faq.items.map((item) => <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-heading text-base font-semibold text-[#0B3B4F] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E8E] sm:text-lg"><span>{item.question}</span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#0B3B4F]/12 text-[#0F766E] transition group-open:rotate-45" aria-hidden="true">+</span></summary>
            <p className="max-w-2xl pr-12 pt-3 text-sm leading-6 text-[#0B3B4F]/65">{item.answer}</p>
          </details>)}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F766E] via-[#0D625F] to-[#0B3B4F] px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" /><div className="pointer-events-none absolute -right-8 -top-12 h-56 w-56 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#A7F3E3]">{content.closing.eyebrow}</p><h2 className="mt-4 font-heading text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl lg:text-6xl">{content.closing.title}</h2><p className="mt-4 max-w-lg text-base leading-7 text-white/75">{content.closing.description}</p></div>
            <Link href="/planner" className="inline-flex min-h-14 shrink-0 items-center gap-3 rounded-full bg-[#F8FAFA] px-6 text-sm font-semibold text-[#0B3B4F] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">{content.closing.button}<ArrowUpRight size={18} /></Link>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>;
}

function BrandInterlude() {
  return <section aria-label="CoolRoute" className="brand-interlude relative isolate overflow-hidden border-y border-white/10 px-5 py-20 text-center sm:py-28">
    <div className="brand-interlude-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
    <Reveal>
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        <h2 className="sr-only">CoolRoute</h2>
        <div className="w-full max-w-[900px]" aria-hidden="true"><ParticleBrandLogo /></div>
      </div>
    </Reveal>
  </section>;
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return <Reveal><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F766E]">{eyebrow}</p><h2 className="mt-4 font-heading text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#0B3B4F] sm:text-5xl">{title}</h2>{body && <p className="mt-4 max-w-xl text-base leading-7 text-[#0B3B4F]/65">{body}</p>}</div></Reveal>;
}
