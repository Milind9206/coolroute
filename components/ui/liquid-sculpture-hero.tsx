"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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

type Particle = { x: number; y: number; z: number; land: boolean; ice: boolean; cloud: boolean; phase: number };

// Simplified geographic coastlines in longitude/latitude. The dense surface
// particles interpolate these outlines into a recognizable world map.
const CONTINENTS: number[][][] = [
  [[-168, 66], [-156, 71], [-143, 70], [-135, 59], [-128, 55], [-124, 48], [-125, 41], [-117, 32], [-111, 29], [-106, 23], [-98, 19], [-91, 19], [-86, 22], [-83, 9], [-78, 8], [-77, 18], [-81, 25], [-80, 32], [-75, 35], [-72, 41], [-66, 45], [-60, 48], [-56, 53], [-61, 58], [-69, 60], [-76, 57], [-81, 62], [-91, 68], [-101, 72], [-111, 72], [-120, 75], [-131, 70], [-141, 70], [-150, 71], [-158, 68]],
  [[-81, 12], [-75, 10], [-70, 12], [-64, 10], [-60, 7], [-51, 4], [-48, -1], [-44, -3], [-39, -8], [-35, -10], [-38, -18], [-42, -23], [-46, -30], [-49, -34], [-53, -42], [-59, -51], [-66, -55], [-71, -49], [-74, -39], [-72, -30], [-77, -20], [-79, -10], [-80, 0]],
  [[-52, 60], [-45, 59], [-39, 63], [-35, 68], [-40, 74], [-46, 81], [-55, 83], [-61, 78], [-58, 71], [-63, 66]],
  [[-17, 36], [-7, 37], [4, 36], [10, 33], [11, 26], [16, 20], [24, 17], [32, 12], [42, 12], [49, 2], [44, -11], [40, -17], [35, -25], [30, -34], [22, -35], [17, -29], [12, -18], [8, -10], [2, -5], [-5, 5], [-12, 11], [-16, 18], [-16, 25], [-10, 31]],
  [[-10, 36], [-7, 44], [-1, 47], [4, 44], [8, 47], [14, 46], [20, 52], [28, 55], [35, 55], [37, 60], [45, 57], [50, 60], [57, 57], [60, 52], [68, 55], [74, 59], [81, 58], [87, 55], [95, 57], [104, 53], [112, 55], [120, 52], [127, 53], [134, 48], [141, 45], [145, 39], [140, 35], [134, 34], [130, 31], [122, 24], [120, 19], [113, 14], [108, 10], [104, 2], [99, 7], [96, 16], [91, 21], [86, 22], [82, 25], [77, 29], [72, 27], [68, 24], [62, 25], [57, 27], [52, 25], [48, 30], [43, 37], [38, 40], [34, 42], [29, 41], [25, 40], [20, 40], [17, 45], [13, 45], [10, 42], [5, 43], [2, 48], [-5, 50], [-8, 55], [-4, 58], [2, 58], [7, 56], [12, 58], [18, 60], [25, 65], [30, 70], [28, 72], [20, 70], [15, 67], [10, 70], [5, 69], [2, 64], [-5, 62], [-10, 58], [-17, 58], [-24, 64], [-21, 69], [-15, 72], [-9, 71], [-5, 68], [-2, 64], [-7, 60], [-9, 54], [-5, 50]],
  [[68, 24], [74, 22], [79, 16], [82, 9], [80, 6], [77, 8], [74, 13]],
  [[95, 22], [101, 21], [108, 18], [111, 12], [109, 5], [105, -1], [108, -6], [115, -8], [119, -3], [124, 1], [130, 5], [133, 12], [128, 18], [121, 21], [115, 19], [109, 22], [103, 25]],
  [[130, 33], [135, 35], [140, 39], [143, 44], [145, 42], [142, 36], [137, 33]],
  [[112, -11], [117, -14], [123, -16], [129, -15], [135, -12], [137, -17], [134, -23], [130, -28], [125, -33], [119, -35], [115, -32], [113, -25], [114, -20]],
  [[48, -13], [50, -16], [49, -24], [46, -26], [45, -19]],
  [[-8, 59], [-5, 58], [-3, 55], [-5, 51], [-8, 54]],
];

function inPolygon(longitude: number, latitude: number, polygon: number[][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > latitude) !== (yj > latitude) && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function isLand(longitude: number, latitude: number) {
  return latitude < -72 || CONTINENTS.some((polygon) => inPolygon(longitude, latitude, polygon));
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
      ice: Math.abs(Math.asin(y)) > 1.18,
      cloud: Math.sin(index * 12.9898) * 43758.5453 % 1 > 0.55,
      phase: (index * 2.399) % (Math.PI * 2),
    };
  });
}

export function ParticleGlobe({ isDark }: { isDark: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const particles = makeParticles(9000);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const landColor = isDark ? [48, 205, 87] : [20, 78, 35];
    const oceanColor = isDark ? [116, 184, 216] : [49, 119, 153];
    const iceColor = isDark ? [224, 240, 233] : [230, 239, 225];
    const pointer = { x: 0, y: 0, target: 0, strength: 0 };
    const rotation = { yawOffset: 0, pitchOffset: 0, yawVelocity: 0, pitchVelocity: 0, dragging: false, lastX: 0, lastY: 0 };
    let automaticYaw = 0;
    let width = 0;
    let height = 0;
    let frameId = 0;
    let startTime = 0;
    let lastFrameTime = 0;

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
      if (rotation.dragging) {
        const dx = event.clientX - rotation.lastX;
        const dy = event.clientY - rotation.lastY;
        rotation.lastX = event.clientX;
        rotation.lastY = event.clientY;
        rotation.yawOffset += dx * 0.014;
        rotation.pitchOffset = Math.max(-1.15, Math.min(1.15, rotation.pitchOffset + dy * 0.008));
        rotation.yawVelocity = dx * 0.0018;
        rotation.pitchVelocity = dy * 0.0015;
        pointer.target = 0;
      } else {
        pointer.target = 1;
      }
      if (reducedMotion && !frameId) frameId = requestAnimationFrame(draw);
    };
    const onPointerDown = (event: PointerEvent) => {
      rotation.dragging = true;
      rotation.lastX = event.clientX;
      rotation.lastY = event.clientY;
      rotation.yawVelocity = 0;
      rotation.pitchVelocity = 0;
      pointer.target = 0;
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => {
      rotation.dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (!frameId) frameId = requestAnimationFrame(draw);
    };
    const onPointerLeave = () => {
      if (!rotation.dragging) pointer.target = 0;
      if (reducedMotion && !frameId) frameId = requestAnimationFrame(draw);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 0.18 : 0.08;
      if (event.key === "ArrowLeft") rotation.yawOffset -= step;
      else if (event.key === "ArrowRight") rotation.yawOffset += step;
      else if (event.key === "ArrowUp") rotation.pitchOffset = Math.max(-1.15, rotation.pitchOffset - step);
      else if (event.key === "ArrowDown") rotation.pitchOffset = Math.min(1.15, rotation.pitchOffset + step);
      else return;
      event.preventDefault();
      if (!frameId) frameId = requestAnimationFrame(draw);
    };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("keydown", onKeyDown);

    const draw = (now: number) => {
      frameId = 0;
      if (!startTime) startTime = now;
      const elapsed = (now - startTime) / 1000;
      const delta = Math.min(0.05, Math.max(0, (now - (lastFrameTime || now)) / 1000));
      lastFrameTime = now;
      if (!rotation.dragging && !reducedMotion) {
        automaticYaw += delta * 0.35;
      }
      if (!rotation.dragging) {
        const inertia = Math.exp(-delta * 5);
        const returnToOrbit = Math.exp(-delta * 1.45);
        rotation.yawVelocity *= inertia;
        rotation.pitchVelocity *= inertia;
        // Preserve the user's full-turn yaw; let the idle spin continue from that angle.
        rotation.yawOffset += rotation.yawVelocity;
        rotation.pitchOffset = (rotation.pitchOffset + rotation.pitchVelocity) * returnToOrbit;
      }
      const formationProgress = reducedMotion ? 1 : Math.min(1, elapsed / 3);
      const formation = 1 - Math.pow(1 - formationProgress, 3);
      const yaw = automaticYaw + rotation.yawOffset;
      const pitch = rotation.pitchOffset;
      const cosine = Math.cos(yaw);
      const sine = Math.sin(yaw);
      const pitchCosine = Math.cos(pitch);
      const pitchSine = Math.sin(pitch);
      const radius = Math.min(width, height) * 0.45;
      const centerX = width / 2;
      const centerY = height / 2;
      pointer.strength += (pointer.target - pointer.strength) * 0.12;

      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
      const visible: { x: number; y: number; nx: number; ny: number; depth: number; land: boolean; ice: boolean; cloud: boolean; phase: number }[] = [];
      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index];
        const rotatedX = particle.x * cosine + particle.z * sine;
        const yawDepth = particle.z * cosine - particle.x * sine;
        const rotatedY = particle.y * pitchCosine - yawDepth * pitchSine;
        const depth = yawDepth * pitchCosine + particle.y * pitchSine;
        if (depth < -0.12) continue;
        visible.push({ x: particle.x, y: particle.y, nx: rotatedX, ny: rotatedY, depth, land: particle.land, ice: particle.ice, cloud: particle.cloud, phase: particle.phase });
      }
      visible.sort((a, b) => a.depth - b.depth);
      for (const particle of visible) {
        const light = Math.max(0.08, particle.nx * -0.48 + particle.ny * 0.4 + particle.depth * 0.79);
        const twinkle = reducedMotion ? 1 : 0.91 + 0.09 * Math.sin(elapsed * 1.2 + particle.phase);
        const shade = 0.48 + light * 0.52;
        const cloudOn = particle.cloud && Math.sin(particle.x * 19 + particle.y * 13 + elapsed * (reducedMotion ? 0 : 0.035)) > 0.78;
        const rgb = cloudOn ? [226, 241, 239] : particle.ice ? iceColor : particle.land ? landColor : oceanColor;
        const baseAlpha = cloudOn ? 0.42 : particle.land ? 1 : 0.98;
        const depthVisibility = particle.depth < 0 ? 0.5 : 0.82 + particle.depth * 0.18;
        const alpha = baseAlpha * depthVisibility * shade * twinkle;
        const size = (cloudOn ? 0.95 : particle.land ? 1.9 : 0.72) + Math.max(0, particle.depth) * 0.4;
        const delay = (Math.sin(particle.phase * 1.73 + particle.y * 5) + 1) * 0.24;
        const arrivalProgress = reducedMotion ? 1 : Math.max(0, Math.min(1, (elapsed - delay) / 2.45));
        const particleFormation = 1 - Math.pow(1 - arrivalProgress, 3);
        const startAngle = particle.phase + Math.sin(particle.phase * 2.41) * 0.72;
        const startDistance = Math.hypot(width, height) * (0.18 + (Math.sin(particle.phase * 3.17) + 1) * 0.39);
        const startX = centerX + Math.cos(startAngle) * startDistance;
        const startY = centerY + Math.sin(startAngle) * startDistance;
        const targetX = centerX + particle.nx * radius;
        const targetY = centerY - particle.ny * radius;
        const travelX = targetX - startX;
        const travelY = targetY - startY;
        const travelLength = Math.max(1, Math.hypot(travelX, travelY));
        const arc = Math.sin(arrivalProgress * Math.PI) * Math.sin(particle.phase * 2.87) * Math.min(width, height) * 0.085;
        let px = startX + travelX * particleFormation - (travelY / travelLength) * arc;
        let py = startY + travelY * particleFormation + (travelX / travelLength) * arc;
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const distance = Math.hypot(dx, dy);
        const scatterRadius = radius * 0.38;
        if (!rotation.dragging && distance > 0.5 && distance < scatterRadius && pointer.strength > 0.002) {
          const falloff = 1 - distance / scatterRadius;
          const push = pointer.strength * falloff * falloff * particleFormation * (particle.land ? 30 : 20);
          px += dx / distance * push;
          py += dy / distance * push;
        }
        context.beginPath();
        context.arc(px, py, size, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.max(0.3, alpha * (0.18 + particleFormation * 0.82))})`;
        context.fill();
      }

      // Fine orbital particles add a little motion without competing with the headline.
      for (let index = 0; index < 18; index++) {
        const angle = yaw * 0.4 + index * Math.PI * 2 / 18;
        const orbitX = centerX + Math.cos(angle) * radius * 1.08;
        const orbitY = centerY + Math.sin(angle) * radius * 0.34;
        context.beginPath();
        context.arc(orbitX, orbitY, index % 3 === 0 ? 1.5 : 1, 0, Math.PI * 2);
        context.fillStyle = `rgba(215, 240, 240, ${(isDark ? 0.38 : 0.34) * formation})`;
        context.fill();
      }

      const returning = Math.abs(rotation.pitchOffset) + Math.abs(rotation.yawVelocity) + Math.abs(rotation.pitchVelocity) > 0.001;
      if (!reducedMotion || pointer.strength > 0.002 || pointer.target > 0 || rotation.dragging || returning) frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("keydown", onKeyDown);
    };
  }, [isDark]);

  return <div className="relative aspect-square w-full min-w-0 max-w-[min(100vw,920px)]">
    <canvas ref={canvasRef} role="img" aria-label="Interactive particle globe. Drag to rotate, or focus and use the arrow keys." tabIndex={0} className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60" />
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
          <Image src="/coolroute-logo.svg" alt={brand} width={180} height={45} priority className={`h-8 w-auto ${isDark ? "brightness-0 invert" : "grayscale"}`} />
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
