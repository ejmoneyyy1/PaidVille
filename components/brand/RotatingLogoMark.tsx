'use client';

import Image from 'next/image';

/**
 * Static brand mark in the top-left of the navbar.
 * Single fixed image, no cycling or flip animation (per client request).
 */
export default function RotatingLogoMark() {
  return (
    <div className="relative h-14 w-14 md:h-[4.25rem] md:w-[4.25rem]">
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-brand-red/50 bg-white/90 shadow-[0_8px_28px_rgba(176,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.85)]">
        <Image
          src="/images/gallery3.jpg"
          alt="PaidVille logo"
          fill
          className="object-cover"
          sizes="(max-width:768px) 56px, 72px"
          priority
        />
      </div>
    </div>
  );
}
