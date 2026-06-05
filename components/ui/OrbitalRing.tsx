'use client';

import {useEffect, useRef} from 'react';

type Star = {
  /** angle around the disc */
  a: number;
  /** normalized radius 0..1 from core */
  r: number;
  /** spiral-arm offset */
  arm: number;
  size: number;
  /** brightness multiplier */
  b: number;
  /** twinkle / dispersion phase */
  phase: number;
  /** outward drift speed for the stardust that escapes the disc */
  drift: number;
};

/**
 * Cosmic particle galaxy — a Saturn/galaxy-like disc of glowing particles that
 * rotates slowly, twinkles, and sheds stardust outward. Rendered on a
 * transparent canvas with additive blending so overlapping particles bloom.
 * White-hot core fades to crimson at the rim (PaidVille red).
 *
 * Designed to sit behind dark hero/section content. Pauses offscreen and draws
 * a single static frame for reduced-motion users.
 */
export default function OrbitalRing({
  className,
  count = 1600,
  tilt = 0.42, // vertical squash of the disc (perspective)
  speed = 0.05, // radians / second
  hue = {core: '255,240,235', mid: '255,70,70', rim: '150,0,0'},
}: {
  className?: string;
  count?: number;
  tilt?: number;
  speed?: number;
  hue?: {core: string; mid: string; rim: string};
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let rotation = 0;
    let last = 0;
    let stars: Star[] = [];

    const lerpColor = (c1: string, c2: string, t: number) => {
      const a = c1.split(',').map(Number);
      const b = c2.split(',').map(Number);
      return `${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(
        a[1] + (b[1] - a[1]) * t
      )},${Math.round(a[2] + (b[2] - a[2]) * t)}`;
    };

    const init = () => {
      stars = Array.from({length: count}, () => {
        // Concentrate particles toward the core for a galaxy falloff.
        const r = Math.pow(Math.random(), 0.6);
        return {
          a: Math.random() * Math.PI * 2,
          r,
          arm: (Math.random() - 0.5) * 0.55,
          size: Math.random() * 1.5 + 0.45,
          b: 0.4 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          drift: Math.random() < 0.12 ? Math.random() * 0.04 : 0,
        };
      });
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      init();
    };

    const draw = (time: number) => {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      if (!prefersReduced) rotation += speed * dt;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.56;

      // Bloom core.
      ctx.globalCompositeOperation = 'source-over';
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.9);
      glow.addColorStop(0, `rgba(${hue.mid},0.22)`);
      glow.addColorStop(0.35, `rgba(${hue.rim},0.12)`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Particles accumulate light (bloom) via additive blending.
      ctx.globalCompositeOperation = 'lighter';

      for (const s of stars) {
        const breathe = prefersReduced ? 0 : Math.sin(time / 1600 + s.phase) * 0.02;
        // Stardust slowly migrates outward, then wraps back in.
        if (s.drift) {
          s.r += s.drift * dt;
          if (s.r > 1.25) s.r = 0.2;
        }
        const rr = s.r + breathe;
        const ang = s.a + rotation * (1.2 - s.r * 0.5) + s.arm * rr;

        const radius = baseR * rr;
        const x = cx + Math.cos(ang) * radius;
        const y = cy + Math.sin(ang) * radius * tilt;

        // Depth: front of the disc (lower half) renders brighter/larger.
        const depth = (Math.sin(ang) + 1) / 2;
        const tw = prefersReduced ? 1 : 0.65 + Math.sin(time / 500 + s.phase) * 0.35;

        // Colour by radius: hot core -> red mid -> crimson rim.
        const col =
          rr < 0.45
            ? lerpColor(hue.core, hue.mid, rr / 0.45)
            : lerpColor(hue.mid, hue.rim, Math.min(1, (rr - 0.45) / 0.7));

        const alpha = s.b * tw * (0.35 + depth * 0.5) * (1 - rr * 0.35);
        const size = s.size * (0.6 + depth * 0.7);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${Math.max(0, alpha)})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || prefersReduced) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    if (prefersReduced) requestAnimationFrame(draw);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start();
          else stop();
        }
      },
      {threshold: 0.01}
    );
    io.observe(parent);

    window.addEventListener('resize', resize);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [count, tilt, speed, hue]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
