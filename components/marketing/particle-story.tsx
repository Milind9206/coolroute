"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ParticleGlobe } from "@/components/ui/liquid-sculpture-hero";

type ParticleStoryProps = {
  description: string;
  primary: string;
  secondary: string;
};

export function ParticleStory({ description, primary, secondary }: ParticleStoryProps) {
  const sceneRef = React.useRef<HTMLElement>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = scene.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const next = Math.max(0, Math.min(1, -rect.top / distance));
      setProgress((current) => Math.abs(current - next) > 0.001 ? next : current);
    };
    const scheduleUpdate = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const copyProgress = Math.max(0, Math.min(1, (progress - 0.58) / 0.32));
  const copyFade = copyProgress * copyProgress * (3 - 2 * copyProgress);

  return <section ref={sceneRef} className="particle-story relative h-[360svh]" aria-label="CoolRoute particle globe story">
    <div className="particle-story-stage sticky top-[76px] isolate h-[calc(100svh-76px)] min-h-[560px] overflow-hidden">
      <div className="particle-story-stars pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
      <div className="particle-story-orb pointer-events-none absolute left-1/2 top-1/2 z-10 flex aspect-square w-[min(78vw,68svh,780px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center before:absolute before:inset-[2%] before:rounded-full before:border before:border-sky-200/15 before:bg-[radial-gradient(circle_at_36%_34%,rgba(26,65,63,0.52),rgba(4,15,15,0.32)_65%,rgba(3,9,9,0.15)_100%)] before:shadow-[0_0_50px_rgba(76,191,204,0.08)] md:w-[min(72vw,78svh,960px)]">
        <div className="aspect-square h-full w-full"><ParticleGlobe isDark /></div>
      </div>

      <div className="absolute inset-x-0 bottom-[7%] z-20 mx-auto flex max-w-3xl flex-col items-center px-5 text-center">
        <div style={{ opacity: copyFade, transform: `translateY(${(1 - copyFade) * 24}px)` }}>
          <h1 className="font-heading text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-[#F1F7F4]">Walk in <span className="text-[#5EEAD4]">the shade.</span></h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-white/72 sm:text-base sm:leading-7">{description}</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link href="/planner" className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#5EEAD4] px-6 text-sm font-semibold text-[#07100D] shadow-[0_0_36px_rgba(94,234,212,.16)] transition hover:-translate-y-0.5 hover:bg-[#8BF3E2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5EEAD4]/35">{primary}<ArrowRight size={17} /></Link>
            <a href="#how-it-works" className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-black/15 px-5 text-sm font-medium text-white/85 backdrop-blur-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4]">{secondary}<ArrowUpRight size={16} /></a>
          </div>
        </div>

      </div>
    </div>
  </section>;
}
