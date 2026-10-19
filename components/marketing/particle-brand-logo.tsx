"use client";

import * as React from "react";

type Point = { x: number; y: number; z: number; phase: number };

/** Builds the CoolRoute logo from the same particle-led visual language as the globe. */
export function ParticleBrandLogo() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const source = new Image();
    source.src = "/coolroute-mark.svg";
    let points: Point[] = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let startTime = 0;
    let lastFrameTime = 0;
    let active = false;
    let formed = false;
    const pointer = { x: 0, y: 0, strength: 0, target: 0 };
    const rotation = { yawOffset: 0, pitchOffset: 0, yawVelocity: 0, pitchVelocity: 0, dragging: false, lastX: 0, lastY: 0 };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const onImageLoad = () => {
      const sampleWidth = 580;
      const sampleHeight = 300;
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = sampleWidth;
      sourceCanvas.height = sampleHeight;
      const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
      if (!sourceContext) return;
      sourceContext.clearRect(0, 0, sampleWidth, sampleHeight);
      sourceContext.drawImage(source, 0, 0, sampleWidth, sampleHeight);
      const pixels = sourceContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
      const sampled: Point[] = [];
      for (let y = 0; y < sampleHeight; y += 2) {
        for (let x = 0; x < sampleWidth; x += 2) {
          if (pixels[(y * sampleWidth + x) * 4 + 3] > 96) {
            // Distribute particles through one continuous, thick extrusion instead of stacked slices.
            sampled.push({
              x: x / sampleWidth,
              y: y / sampleHeight,
              z: Math.random() * 2 - 1,
              phase: Math.random() * Math.PI * 2,
            });
          }
        }
      }
      points = sampled;
      if (active && !frameId) frameId = requestAnimationFrame(draw);
    };
    source.addEventListener("load", onImageLoad);

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      if (rotation.dragging) {
        const dx = event.clientX - rotation.lastX;
        const dy = event.clientY - rotation.lastY;
        rotation.lastX = event.clientX;
        rotation.lastY = event.clientY;
        rotation.yawOffset += dx * 0.008;
        rotation.pitchOffset = Math.max(-0.7, Math.min(0.7, rotation.pitchOffset + dy * 0.006));
        rotation.yawVelocity = dx * 0.0018;
        rotation.pitchVelocity = dy * 0.0014;
        pointer.target = 0;
      } else {
        pointer.target = 1;
      }
      if (!frameId && active) frameId = requestAnimationFrame(draw);
    };
    const onPointerLeave = () => {
      if (!rotation.dragging) pointer.target = 0;
      if (!frameId && active) frameId = requestAnimationFrame(draw);
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
      if (!frameId && active) frameId = requestAnimationFrame(draw);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 0.16 : 0.07;
      if (event.key === "ArrowLeft") rotation.yawOffset -= step;
      else if (event.key === "ArrowRight") rotation.yawOffset += step;
      else if (event.key === "ArrowUp") rotation.pitchOffset = Math.max(-0.7, rotation.pitchOffset - step);
      else if (event.key === "ArrowDown") rotation.pitchOffset = Math.min(0.7, rotation.pitchOffset + step);
      else return;
      event.preventDefault();
      if (!frameId && active) frameId = requestAnimationFrame(draw);
    };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("keydown", onKeyDown);

    const draw = (now: number) => {
      frameId = 0;
      if (!startTime) startTime = now;
      const elapsed = (now - startTime) / 1000;
      const delta = Math.min(0.05, Math.max(0, (now - (lastFrameTime || now)) / 1000));
      lastFrameTime = now;
      if (!rotation.dragging) {
        const inertia = Math.exp(-delta * 5);
        const returnToOrbit = Math.exp(-delta * 1.35);
        rotation.yawVelocity *= inertia;
        rotation.pitchVelocity *= inertia;
        rotation.yawOffset = (rotation.yawOffset + rotation.yawVelocity) * returnToOrbit;
        rotation.pitchOffset = Math.max(-0.7, Math.min(0.7, (rotation.pitchOffset + rotation.pitchVelocity) * returnToOrbit));
      }
      const yaw = Math.sin(now * 0.00028) * 0.22 + rotation.yawOffset;
      const pitch = Math.sin(now * 0.00031) * 0.045 + rotation.pitchOffset;
      const yawCos = Math.cos(yaw);
      const yawSin = Math.sin(yaw);
      const pitchCos = Math.cos(pitch);
      const pitchSin = Math.sin(pitch);
      pointer.strength += (pointer.target - pointer.strength) * 0.1;
      context.clearRect(0, 0, width, height);

      const scale = Math.min(width * 0.96, height * (580 / 300));
      const drawWidth = scale;
      const drawHeight = scale * (300 / 580);
      const left = (width - drawWidth) / 2;
      const top = (height - drawHeight) / 2;
      const scatterRadius = Math.max(90, Math.min(width, height) * 0.42);

      for (const point of points) {
        const rawTargetX = left + point.x * drawWidth;
        const rawTargetY = top + point.y * drawHeight;
        const offsetX = rawTargetX - width / 2;
        const sourceY = rawTargetY - height / 2;
        const sourceZ = point.z * Math.min(width, height) * 0.12;
        const rotatedX = offsetX * yawCos + sourceZ * yawSin;
        const rotatedZ = -offsetX * yawSin + sourceZ * yawCos;
        const rotatedY = sourceY * pitchCos - rotatedZ * pitchSin;
        const depth = sourceY * pitchSin + rotatedZ * pitchCos;
        const focalLength = Math.max(width, height) * 2.8;
        const perspective = focalLength / (focalLength + depth);
        const targetX = width / 2 + rotatedX * perspective;
        const targetY = height / 2 + rotatedY * perspective;
        const delay = (Math.sin(point.phase * 1.73 + point.x * 5) + 1) * 0.24;
        const arrivalProgress = reducedMotion ? 1 : Math.max(0, Math.min(1, (elapsed - delay) / 2.45));
        const particleFormation = 1 - Math.pow(1 - arrivalProgress, 3);
        const angle = point.phase + Math.sin(point.phase * 2.41) * 0.72;
        const distance = Math.hypot(width, height) * (0.18 + (Math.sin(point.phase * 3.17) + 1) * 0.39);
        const startX = width / 2 + Math.cos(angle) * distance;
        const startY = height / 2 + Math.sin(angle) * distance;
        const travelX = targetX - startX;
        const travelY = targetY - startY;
        const travelLength = Math.max(1, Math.hypot(travelX, travelY));
        const arc = Math.sin(arrivalProgress * Math.PI) * Math.sin(point.phase * 2.87) * Math.min(width, height) * 0.085;
        let x = startX + travelX * particleFormation - (travelY / travelLength) * arc;
        let y = startY + travelY * particleFormation + (travelX / travelLength) * arc;
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const pointerDistance = Math.hypot(dx, dy);
        if (pointerDistance > 1 && pointerDistance < scatterRadius && pointer.strength > 0.01) {
          const force = (1 - pointerDistance / scatterRadius) * pointer.strength * 20;
          x += (dx / pointerDistance) * force;
          y += (dy / pointerDistance) * force;
        }
        const faceLight = Math.max(0.24, 0.72 + point.z * Math.sin(yaw) * 0.42 + Math.cos(yaw) * 0.16);
        const shimmer = (0.78 + Math.sin(now * 0.0012 + point.phase) * 0.1) * (0.82 + perspective * 0.18) * faceLight;
        context.beginPath();
        context.arc(x, y, 1.05 + perspective * 0.35, 0, Math.PI * 2);
        const edgeTint = point.z * Math.sin(yaw) < -0.12 ? "44, 126, 119" : "94, 234, 212";
        context.fillStyle = `rgba(${edgeTint}, ${shimmer})`;
        context.fill();
      }

      formed = elapsed >= 3;
      const returning = Math.abs(rotation.yawOffset) + Math.abs(rotation.pitchOffset) + Math.abs(rotation.yawVelocity) + Math.abs(rotation.pitchVelocity) > 0.001;
      if (active && (!reducedMotion || !formed || pointer.strength > 0.01 || pointer.target > 0.01 || rotation.dragging || returning)) frameId = requestAnimationFrame(draw);
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) {
        if (!formed && !startTime) startTime = performance.now();
        if (!frameId) frameId = requestAnimationFrame(draw);
      } else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    }, { threshold: 0.15 });
    intersectionObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      source.removeEventListener("load", onImageLoad);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return <canvas ref={canvasRef} role="img" aria-label="Interactive three-dimensional CoolRoute icon. Drag to rotate, or focus and use the arrow keys." tabIndex={0} width={580} height={300} className="particle-brand-logo block h-auto w-full cursor-grab touch-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60" />;
}
