'use client';

import {useEffect, useRef} from 'react';

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  r: number;
};

/**
 * Lightweight canvas starfield. Particles drift, link into constellations
 * when close, and gently repel from the cursor. Pauses when offscreen and
 * for reduced-motion users.
 */
export default function ParticleField({
  className,
  color = '255,255,255',
  count = 90,
  repelRadius = 130,
  linkDistance = 108,
}: {
  className?: string;
  color?: string;
  count?: number;
  repelRadius?: number;
  linkDistance?: number;
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
    let particles: Particle[] = [];
    const mouse = {x: -9999, y: -9999};

    const init = () => {
      particles = Array.from({length: count}, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.4,
      }));
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

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx * (0.5 + p.z);
        p.y += p.vy * (0.5 + p.z);
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        let ox = 0;
        let oy = 0;
        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          ox = (dx / dist) * force * 22;
          oy = (dy / dist) * force * 22;
        }

        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.r * (0.6 + p.z), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${0.25 + p.z * 0.6})`;
        ctx.fill();
      }

      // Constellation links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDistance) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${color},${(1 - d / linkDistance) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || prefersReduced) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    if (prefersReduced) {
      draw();
      stop();
    }

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

    window.addEventListener('mousemove', onMove, {passive: true});
    window.addEventListener('resize', resize);
    parent.addEventListener('mouseleave', onLeave);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      parent.removeEventListener('mouseleave', onLeave);
    };
  }, [color, count, repelRadius, linkDistance]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
