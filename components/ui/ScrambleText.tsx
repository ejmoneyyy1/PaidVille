'use client';

import {useEffect, useRef, useState, type ElementType} from 'react';
import {useReducedMotion} from 'framer-motion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@%&*<>/0123456789';

/**
 * Decode/scramble text effect — characters flicker through random glyphs then
 * resolve left-to-right. Runs once when it scrolls into view. A creative,
 * "terminal decrypt" reveal for headlines. Static for reduced-motion users.
 */
export default function ScrambleText({
  text,
  className,
  as,
  duration = 1100,
}: {
  text: string;
  className?: string;
  as?: ElementType;
  duration?: number;
}) {
  const Tag = (as ?? 'span') as ElementType;
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const revealed = Math.floor(p * text.length);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (i < revealed || text[i] === ' ') out += text[i];
          else out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        setDisplay(out);
        if (p < 1) raf = requestAnimationFrame(tick);
        else setDisplay(text);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !ran.current) {
            ran.current = true;
            run();
          }
        }
      },
      {threshold: 0.3}
    );
    io.observe(node);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [text, reduced, duration]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {display}
    </Tag>
  );
}
