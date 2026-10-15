"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Moon, Sun } from "lucide-react";

type Cta = { label: string; href: string };

export interface SculptureHeroProps {
  brand?: string;
  eyebrow?: string;
  headline?: string;
  headlineAccent?: string;
  body?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta | null;
  backdropText?: string;
  src?: string;
  darkSrc?: string;
  mobileSrc?: string;
  mobileDarkSrc?: string;
  /** Controlled theme. If omitted, the hero keeps its own state. */
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
  onSignOut?: () => void;
}

// Stock photos. Swap any of these; if one fails to load, a procedural shape is used.
const IMG_LIGHT = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=70";
const IMG_DARK = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=70";
const IMG_LIGHT_M = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=70";
const IMG_DARK_M = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=70";

const QUAD_VS = `#version 300 es
out vec2 vUv;
void main(){
  vec2 p = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
  vUv = p; gl_Position = vec4(p * 2. - 1., 0., 1.);
}`;

const SIM_FS = `#version 300 es
precision highp float;
uniform sampler2D uPos, uHome;
uniform vec2 uPointer; uniform float uTime, uDt, uPointerOn, uAspect;
in vec2 vUv; out vec4 o;
void main(){
  vec4 p = texture(uPos, vUv), h = texture(uHome, vUv);
  vec2 pos = p.xy, vel = p.zw;
  vec2 target = h.xy + 0.006 * vec2(
    sin(uTime*0.8 + h.w*40. + h.y*6.), cos(uTime*0.7 + h.w*30. + h.x*6.));
  vec2 f = (target - pos) * 7.0;
  vec2 d = pos - uPointer; d.x *= uAspect;
  float push = uPointerOn * smoothstep(0.12, 0.0, length(d));
  f += normalize(d + 1e-5) * push * 1.15;
  vel = (vel + f * uDt) * exp(-3.2 * uDt);
  pos += vel * uDt;
  o = vec4(pos, vel);
}`;

const DRAW_VS = `#version 300 es
precision highp float;
uniform sampler2D uPos, uHome; uniform int uSize; uniform float uPx;
out float vL; out float vS;
void main(){
  ivec2 c = ivec2(gl_VertexID % uSize, gl_VertexID / uSize);
  vec4 p = texelFetch(uPos, c, 0), h = texelFetch(uHome, c, 0);
  gl_Position = vec4(p.xy * 2. - 1., 0., 1.);
  gl_PointSize = uPx * (0.8 + h.w * 1.1);
  vL = h.z; vS = clamp(length(p.zw) * 2.0, 0., 1.);
}`;

const DRAW_FS = `#version 300 es
precision highp float;
uniform float uDark; in float vL; in float vS; out vec4 o;
void main(){
  float r = length(gl_PointCoord - .5) * 2.;
  if (r > 1.) discard;
  float a = smoothstep(1., .2, r);
  vec3 dark = mix(vec3(.15,.55,.5), vec3(1.,.95,.8), vL);
  vec3 light = mix(vec3(.1,.45,.38), vec3(.04,.12,.1), vL);
  vec3 col = mix(light, dark, uDark) + vS * 0.35;
  o = vec4(col, a * mix(.75, .55, uDark));
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
  return s;
}
function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
  return p;
}
function floatTex(gl: WebGL2RenderingContext, size: number, data: Float32Array | null) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size, size, 0, gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

/** Draw the image (cover-fit) or a procedural shape, then sample particle homes from it. */
function sampleHomes(img: HTMLImageElement | null, aspect: number, dark: boolean, count: number) {
  const W = 256, H = Math.max(64, Math.round(W / aspect));
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  if (img && img.naturalWidth) {
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  } else {
    ctx.fillStyle = dark ? "#000" : "#fff";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = dark ? "#fff" : "#000";
    ctx.lineWidth = H * 0.09;
    ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = H * 0.08;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * Math.PI * 2;
      const r = H * 0.3 * (1 + 0.18 * Math.sin(3 * t) + 0.09 * Math.sin(5 * t + 1));
      const x = W * 0.68 + r * Math.cos(t), y = H * 0.5 + r * Math.sin(t);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  const px = ctx.getImageData(0, 0, W, H).data;
  const cum = new Float32Array(W * H);
  let sum = 0;
  for (let i = 0; i < W * H; i++) {
    const l = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    sum += Math.pow(dark ? l : 1 - l, 1.5) + 0.02;
    cum[i] = sum;
  }
  const out = new Float32Array(count * 4);
  for (let k = 0; k < count; k++) {
    const r = Math.random() * sum;
    let lo = 0, hi = cum.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; cum[m] < r ? (lo = m + 1) : (hi = m); }
    const x = (lo % W + Math.random()) / W, y = 1 - (Math.floor(lo / W) + Math.random()) / H;
    const l = (0.2126 * px[lo * 4] + 0.7152 * px[lo * 4 + 1] + 0.0722 * px[lo * 4 + 2]) / 255;
    out.set([x, y, dark ? l : 1 - l, Math.random()], k * 4);
  }
  return out;
}

export default function SculptureHero({
  brand = "CoolRoute®",
  eyebrow = "Pedestrian Routing Engine — Shade & Heat Budgets",
  headline = "Walk in the\nliving shade.",
  headlineAccent = "living shade.",
  body = "Standard maps optimise only for shortest distance. CoolRoute models street segments, solar angles, slope effort, and crossing wait times to keep you within your personal heat-exposure budget.",
  primaryCta = { label: "Open Route Planner", href: "#planner" },
  secondaryCta,
  backdropText = "coolroute",
  src = IMG_LIGHT,
  darkSrc = IMG_DARK,
  mobileSrc = IMG_LIGHT_M,
  mobileDarkSrc = IMG_DARK_M,
  theme,
  onThemeChange,
  onSignOut,
}: SculptureHeroProps) {
  const [innerTheme, setInnerTheme] = React.useState<"light" | "dark">("dark");
  const current = theme ?? innerTheme;
  const isDark = current === "dark";
  const [mobile, setMobile] = React.useState(false);
  const [noGL, setNoGL] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const darkMixRef = React.useRef(isDark ? 1 : 0);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const f = () => setMobile(mq.matches);
    f(); mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setInnerTheme(next);
    onThemeChange?.(next);
  };

  const activeSrc = mobile ? (isDark ? mobileDarkSrc : mobileSrc) : isDark ? darkSrc : src;

  React.useEffect(() => {
    const canvas = canvasRef.current, section = sectionRef.current;
    if (!canvas || !section) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) { setNoGL(true); return; }
    setNoGL(false);

    const SIZE = mobile ? 96 : 160, COUNT = SIZE * SIZE;
    let raf = 0, disposed = false, img: HTMLImageElement | null = null;
    let simP: WebGLProgram, drawP: WebGLProgram, homeTex: WebGLTexture;
    const posTex: WebGLTexture[] = [], fbo: WebGLFramebuffer[] = [];
    try {
      simP = program(gl, QUAD_VS, SIM_FS);
      drawP = program(gl, DRAW_VS, DRAW_FS);
    } catch { setNoGL(true); return; }

    const init = new Float32Array(COUNT * 4);
    for (let i = 0; i < COUNT; i++) init.set([Math.random(), Math.random(), 0, 0], i * 4);
    for (let i = 0; i < 2; i++) {
      posTex.push(floatTex(gl, SIZE, init));
      const f = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, posTex[i], 0);
      fbo.push(f);
    }
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { setNoGL(true); return; }
    homeTex = floatTex(gl, SIZE, null);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const buildHome = () => {
      const data = sampleHomes(img, canvas.width / Math.max(1, canvas.height), isDark, COUNT);
      gl.bindTexture(gl.TEXTURE_2D, homeTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, SIZE, SIZE, 0, gl.RGBA, gl.FLOAT, data);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.floor(section.clientWidth * dpr));
      canvas.height = Math.max(2, Math.floor(section.clientHeight * dpr));
      buildHome();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(section);
    resize();

    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => { if (!disposed) { img = im; buildHome(); } };
    im.onerror = () => { /* procedural fallback already in use */ };
    im.src = activeSrc;

    const ptr = { x: 0.5, y: 0.5, on: 0, target: 0 };
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      ptr.x = (e.clientX - r.left) / r.width;
      ptr.y = 1 - (e.clientY - r.top) / r.height;
      ptr.target = 1;
    };
    const onLeave = () => (ptr.target = 0);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    let cur = 0, last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      ptr.on += (ptr.target - ptr.on) * 0.065;
      darkMixRef.current += ((isDark ? 1 : 0) - darkMixRef.current) * (1 - Math.exp(-dt / 0.8));

      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[1 - cur]);
      gl.viewport(0, 0, SIZE, SIZE);
      gl.useProgram(simP);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, homeTex);
      gl.uniform1i(U(simP, "uPos"), 0); gl.uniform1i(U(simP, "uHome"), 1);
      gl.uniform2f(U(simP, "uPointer"), ptr.x, ptr.y);
      gl.uniform1f(U(simP, "uTime"), (now - t0) / 1000);
      gl.uniform1f(U(simP, "uDt"), dt);
      gl.uniform1f(U(simP, "uPointerOn"), ptr.on);
      gl.uniform1f(U(simP, "uAspect"), canvas.width / canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      cur = 1 - cur;

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(drawP);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, homeTex);
      gl.uniform1i(U(drawP, "uPos"), 0); gl.uniform1i(U(drawP, "uHome"), 1);
      gl.uniform1i(U(drawP, "uSize"), SIZE);
      gl.uniform1f(U(drawP, "uPx"), Math.max(1.6, (canvas.width / 1440) * 2.4));
      gl.uniform1f(U(drawP, "uDark"), darkMixRef.current);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      posTex.forEach((t) => gl.deleteTexture(t));
      fbo.forEach((f) => gl.deleteFramebuffer(f));
      gl.deleteTexture(homeTex);
      gl.deleteProgram(simP);
      gl.deleteProgram(drawP);
      gl.deleteVertexArray(vao);
    };
  }, [isDark, mobile, activeSrc]);

  const lines = headline.split("\n");
  return (
    <section
      ref={sectionRef}
      className={`relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden transition-colors duration-1000 ease-in-out ${
        isDark ? "bg-[#07100d] text-white" : "bg-[#f3f1ea] text-[#10201a]"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 flex select-none items-center justify-center text-4xl font-semibold leading-none tracking-tight transition-colors duration-1000 md:text-5xl ${
          isDark ? "text-white/[0.04]" : "text-black/[0.05]"
        }`}
      >
        {backdropText}
      </div>

      {noGL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={activeSrc} alt="" crossOrigin="anonymous" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 -z-10 h-full w-full" />
      )}

      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">{brand}</span>
          {onSignOut && <button type="button" onClick={onSignOut} className={`rounded-full px-3 py-2 text-sm transition-colors ${isDark ? "text-white/55 hover:bg-white/10 hover:text-white" : "text-black/55 hover:bg-black/5 hover:text-black"}`}>Sign out</button>}
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-1000 hover:rotate-12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50 ${
            isDark ? "border-white/20 hover:bg-white/10" : "border-black/20 hover:bg-black/5"
          }`}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </nav>

      <div className="flex flex-1 flex-col justify-center px-6 pb-16 md:px-12">
        <p className={`mb-4 text-sm font-semibold uppercase tracking-[0.16em] transition-colors duration-1000 md:text-base ${isDark ? "text-emerald-300" : "text-emerald-900"}`}>
          {eyebrow}
        </p>
        <h1 className="max-w-4xl text-6xl font-semibold leading-[1.02] tracking-tight md:text-8xl">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {headlineAccent && line.includes(headlineAccent) ? (
                <>
                  {line.replace(headlineAccent, "")}
                  <span className={`transition-colors duration-1000 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>{headlineAccent}</span>
                </>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>
        <p className={`mt-6 max-w-2xl text-lg leading-relaxed transition-colors duration-1000 md:text-xl ${isDark ? "text-white/80" : "text-black/75"}`}>{body}</p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href={primaryCta.href}
            className={`inline-flex min-h-14 items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold transition hover:gap-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50 ${
              isDark ? "bg-emerald-300 text-black" : "bg-emerald-800 text-white"
            }`}
          >
            {primaryCta.label} <ArrowRight className="h-5 w-5" />
          </Link>
          {secondaryCta && <Link
            href={secondaryCta.href}
            className={`inline-flex items-center rounded-full border px-6 py-3 text-sm font-medium transition ${
              isDark ? "border-white/25 hover:bg-white/10" : "border-black/25 hover:bg-black/5"
            }`}
          >
            {secondaryCta.label}
          </Link>}
        </div>
      </div>
    </section>
  );
}
