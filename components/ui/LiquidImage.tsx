'use client';

import {useId, useRef, useState} from 'react';
import Image from 'next/image';
import {animate, useReducedMotion} from 'framer-motion';

/**
 * Image with a liquid distortion ripple on hover — a Codrops-style "gooey"
 * effect done with an SVG feTurbulence + feDisplacementMap filter (no WebGL
 * context per card, so it scales across a whole grid). At rest the displacement
 * is 0 (image is pristine); on hover the scale ramps 0 → peak → 0 for a wobble.
 * Respects reduced motion.
 */
export default function LiquidImage({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  priority,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const reduced = useReducedMotion();
  const rawId = useId().replace(/[:]/g, '');
  const filterId = `liquid-${rawId}`;
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  // Apply the filter ONLY during the hover ripple — a persistent url() filter
  // from a 0×0 SVG can make the image invisible in Safari. At rest: no filter.
  const [active, setActive] = useState(false);

  const ripple = () => {
    if (reduced || !dispRef.current) return;
    const disp = dispRef.current;
    const turb = turbRef.current;
    setActive(true);
    animate(0, 1, {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (t) => {
        const scale = Math.sin(t * Math.PI) * 26;
        disp.setAttribute('scale', String(scale));
        if (turb) turb.setAttribute('baseFrequency', `${0.008 + t * 0.01} ${0.012 + t * 0.012}`);
      },
      onComplete: () => setActive(false),
    });
  };

  return (
    <div
      className={className}
      onMouseEnter={ripple}
      style={!reduced && active ? {filter: `url(#${filterId})`} : undefined}
    >
      {!reduced && (
        <svg aria-hidden className="absolute h-0 w-0">
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                ref={turbRef}
                type="fractalNoise"
                baseFrequency="0.008 0.012"
                numOctaves="2"
                seed="4"
                result="noise"
              />
              <feDisplacementMap
                ref={dispRef}
                in="SourceGraphic"
                in2="noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
      <Image
        src={src}
        alt={alt}
        fill
                        loading="eager"
        sizes={sizes}
        priority={priority}
        className={imgClassName ?? 'object-cover'}
      />
    </div>
  );
}
