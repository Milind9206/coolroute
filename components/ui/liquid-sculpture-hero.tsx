"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import LanguageToggle from "@/components/language-toggle";
import ReportIssueToggle from "@/components/report-issue-toggle";

type Cta = { label: string; href: string };

export interface SculptureHeroProps {
  brand?: string;
  eyebrow?: string;
  headline?: string;
  headlineAccent?: string;
  body?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta | null;
  /** Controlled theme. If omitted, the hero keeps its own state. */
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
  onSignOut?: () => void;
}

type Particle = { x: number; y: number; z: number; land: boolean; phase: number };

const LAND_SHAPES = [
  [-108, 48, 34, 22], [-98, 22, 22, 17], [-72, -17, 17, 40],
  [-42, 72, 17, 10], [12, 48, 18, 13], [20, 8, 19, 37],
  [48, 28, 28, 17], [82, 48, 45, 24], [112, 16, 28, 20],
  [135, -25, 19, 12], [48, -15, 15, 16],
];

function isLand(longitude: number, latitude: number) {
  return LAND_SHAPES.some(([centerLon, centerLat, width, height]) => {
    const rawDelta = Math.abs(longitude - centerLon);
    const deltaLon = Math.min(rawDelta, 360 - rawDelta);
    const coastNoise = 0.11 * Math.sin(longitude * 0.19 + latitude * 0.13)
      + 0.055 * Math.sin(longitude * 0.43 - latitude * 0.31)
      + 0.025 * Math.cos(longitude * 0.91 + latitude * 0.67);
    return (deltaLon / width) ** 2 + ((latitude - centerLat) / height) ** 2 < 1 + coastNoise;
  });
}

function makeParticles(count: number): Particle[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - 2 * (index + 0.5) / count;
    const ringRadius = Math.sqrt(1 - y * y);
    const longitude = goldenAngle * index;
    const x = Math.cos(longitude) * ringRadius;
    const z = Math.sin(longitude) * ringRadius;
    return {
      x, y, z,
      land: isLand(Math.atan2(z, x) * 180 / Math.PI, Math.asin(y) * 180 / Math.PI),
      phase: (index * 2.399) % (Math.PI * 2),
    };
  });
}

function ParticleGlobe({ isDark }: { isDark: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const particles = makeParticles(2600);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = isDark ? "248, 255, 250" : "74, 91, 39";
    const pointer = { x: 0, y: 0, target: 0, strength: 0 };
    let width = 0;
    let height = 0;
    let frameId = 0;
    let startTime = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.target = 1;
      if (reducedMotion && !frameId) frameId = requestAnimationFrame(draw);
    };
    const onPointerLeave = () => {
      pointer.target = 0;
      if (reducedMotion && !frameId) frameId = requestAnimationFrame(draw);
    };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const draw = (now: number) => {
      frameId = 0;
      if (!startTime) startTime = now;
      const elapsed = (now - startTime) / 1000;
      const rotation = reducedMotion ? 0.45 : elapsed * 0.19;
      const cosine = Math.cos(rotation);
      const sine = Math.sin(rotation);
      const radius = Math.min(width, height) * 0.42;
      const centerX = width / 2;
      const centerY = height / 2;
      pointer.strength += (pointer.target - pointer.strength) * 0.12;

      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(centerX, centerY, radius * 0.55, centerX, centerY, radius * 1.35);
      glow.addColorStop(0, isDark ? "rgba(84, 151, 110, 0.12)" : "rgba(105, 128, 54, 0.10)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      // Layered atmospheric glow and a shaded edge make the particle sphere read as a planet.
      const atmosphere = context.createRadialGradient(centerX, centerY, radius * 0.82, centerX, centerY, radius * 1.12);
      atmosphere.addColorStop(0, "rgba(0, 0, 0, 0)");
      atmosphere.addColorStop(0.72, isDark ? "rgba(146, 220, 188, 0.10)" : "rgba(122, 143, 69, 0.08)");
      atmosphere.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = atmosphere;
      context.fillRect(centerX - radius * 1.2, centerY - radius * 1.2, radius * 2.4, radius * 2.4);

      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${color}, ${isDark ? 0.3 : 0.34})`;
      context.lineWidth = 1.2;
      context.stroke();
      context.save();
      context.beginPath();
      context.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
      context.clip();
      context.strokeStyle = `rgba(${color}, ${isDark ? 0.085 : 0.11})`;
      context.lineWidth = 0.8;
      context.beginPath();
      context.ellipse(centerX, centerY, radius * Math.abs(Math.cos(rotation)), radius, 0, 0, Math.PI * 2);
      context.stroke();
      for (const latitude of [-0.5, 0, 0.5]) {
        const latY = centerY - latitude * radius;
        const latRadius = radius * Math.sqrt(1 - latitude * latitude);
        context.beginPath();
        context.ellipse(centerX, latY, latRadius, latRadius * 0.23, 0, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();

      const visible: { x: number; y: number; nx: number; ny: number; depth: number; land: boolean; phase: number }[] = [];
      for (const particle of particles) {
        const rotatedX = particle.x * cosine + particle.z * sine;
        const depth = particle.z * cosine - particle.x * sine;
        if (depth < -0.12) continue;
        visible.push({ x: centerX + rotatedX * radius, y: centerY - particle.y * radius, nx: rotatedX, ny: particle.y, depth, land: particle.land, phase: particle.phase });
      }
      visible.sort((a, b) => a.depth - b.depth);
      for (const particle of visible) {
        const light = Math.max(0, particle.nx * -0.42 + particle.ny * 0.36 + particle.depth * 0.82);
        const twinkle = reducedMotion ? 1 : 0.86 + 0.14 * Math.sin(elapsed * 1.2 + particle.phase);
        const shade = 0.52 + light * 0.48;
        const alpha = (particle.land ? 0.5 + particle.depth * 0.36 : 0.1 + particle.depth * 0.2) * shade * twinkle;
        const size = (particle.land ? 1.15 : 0.58) + Math.max(0, particle.depth) * 0.9;
        let px = particle.x;
        let py = particle.y;
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const distance = Math.hypot(dx, dy);
        const scatterRadius = radius * 0.38;
        if (distance > 0.5 && distance < scatterRadius && pointer.strength > 0.002) {
          const falloff = 1 - distance / scatterRadius;
          const push = pointer.strength * falloff * falloff * (particle.land ? 30 : 20);
          px += dx / distance * push;
          py += dy / distance * push;
        }
        context.beginPath();
        context.arc(px, py, size, 0, Math.PI * 2);
        context.fillStyle = `rgba(${color}, ${Math.max(0.05, alpha)})`;
        context.fill();
      }

      // Fine orbital particles add a little motion without competing with the headline.
      for (let index = 0; index < 18; index++) {
        const angle = (reducedMotion ? 0 : elapsed * 0.22) + index * Math.PI * 2 / 18;
        const orbitX = centerX + Math.cos(angle) * radius * 1.08;
        const orbitY = centerY + Math.sin(angle) * radius * 0.34;
        context.beginPath();
        context.arc(orbitX, orbitY, index % 3 === 0 ? 1.5 : 1, 0, Math.PI * 2);
        context.fillStyle = `rgba(${color}, ${isDark ? 0.48 : 0.42})`;
        context.fill();
      }

      if (!reducedMotion || pointer.strength > 0.002 || pointer.target > 0) frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [isDark]);

  return <div className="relative h-[250px] w-[250px] sm:h-[310px] sm:w-[310px] md:h-[390px] md:w-[390px] lg:h-auto lg:w-full lg:max-w-[460px] lg:aspect-square">
    <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full cursor-crosshair" />
  </div>;
}

export default function SculptureHero({
  brand = "CoolRoute",
  eyebrow = "A cooler way to get there",
  headline = "Walk in the\nliving shade.",
  headlineAccent = "living shade.",
  body = "Plan a walking route around shade, sunlight and your comfort.",
  primaryCta = { label: "Plan a walk", href: "/planner" },
  secondaryCta,
  theme,
  onThemeChange,
  onSignOut,
}: SculptureHeroProps) {
  const { t } = useLanguage();
  const [innerTheme, setInnerTheme] = React.useState<"light" | "dark">("dark");
  const current = theme ?? innerTheme;
  const isDark = current === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setInnerTheme(next);
    onThemeChange?.(next);
  };

  const lines = headline.split("\n");
  return (
    <section className={`relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden transition-colors duration-1000 ease-in-out ${isDark ? "bg-[#07100d] text-white" : "bg-[#f3f1ea] text-[#10201a]"}`}>
      <nav className="flex items-center justify-between gap-3 px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <span className={`text-lg font-semibold tracking-tight transition-colors duration-1000 ${isDark ? "text-[#b5e6a2]" : "text-[#10201a]"}`}>{brand}</span>
          {onSignOut && <button type="button" onClick={onSignOut} className={`rounded-full px-3 py-2 text-sm transition-colors ${isDark ? "text-white/55 hover:bg-white/10 hover:text-white" : "text-black/55 hover:bg-black/5 hover:text-black"}`}>{t("Sign out")}</button>}
        </div>
        <div className="flex items-center gap-2"><ReportIssueToggle /><LanguageToggle compact /></div>
        <button type="button" onClick={toggle} aria-label={t(isDark ? "Switch to light mode" : "Switch to dark mode")} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-1000 hover:rotate-12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50 ${isDark ? "border-white/20 hover:bg-white/10" : "border-black/20 hover:bg-black/5"}`}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </nav>

      <div className="flex flex-1 flex-col justify-center gap-2 px-6 pb-10 md:px-12 md:pb-16 lg:flex-row lg:items-center lg:gap-0">
        <div className="min-w-0 lg:w-[58%]">
          <p className={`mb-4 text-sm font-semibold uppercase tracking-[0.16em] transition-colors duration-1000 md:text-base ${isDark ? "text-[#b5e6a2]" : "text-emerald-900"}`}>{eyebrow}</p>
          <h1 className="text-6xl font-semibold leading-[1.02] tracking-tight sm:text-7xl xl:text-8xl">
            {lines.map((line, index) => <span key={index} className="block">{headlineAccent && line.includes(headlineAccent) ? <>{line.replace(headlineAccent, "")}<span className={`transition-colors duration-1000 ${isDark ? "text-[#b5e6a2]" : "text-emerald-700"}`}>{headlineAccent}</span></> : line}</span>)}
          </h1>
          <p className={`mt-6 max-w-2xl text-lg leading-relaxed transition-colors duration-1000 md:text-xl ${isDark ? "text-white/80" : "text-black/75"}`}>{body}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={primaryCta.href} className={`inline-flex min-h-14 items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold transition hover:gap-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50 ${isDark ? "bg-emerald-300 text-black" : "bg-emerald-800 text-white"}`}>
              {primaryCta.label} <ArrowRight className="h-5 w-5" />
            </Link>
            {secondaryCta && <Link href={secondaryCta.href} className={`inline-flex items-center rounded-full border px-6 py-3 text-sm font-medium transition ${isDark ? "border-white/25 hover:bg-white/10" : "border-black/25 hover:bg-black/5"}`}>{secondaryCta.label}</Link>}
          </div>
        </div>

        <div className="flex w-full items-center justify-center lg:w-[42%]">
          <ParticleGlobe isDark={isDark} />
        </div>
      </div>
    </section>
  );
}
