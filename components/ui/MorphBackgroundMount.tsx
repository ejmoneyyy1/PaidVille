'use client';

import dynamic from 'next/dynamic';

// WebGL must load client-only (no SSR on the Cloudflare worker).
const MorphParticles = dynamic(() => import('@/components/ui/MorphParticles'), {ssr: false});

export default function MorphBackgroundMount() {
  return (
    <>
      <MorphParticles />
      {/* Readability scrim so content stays legible over the particles */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{background: 'linear-gradient(to bottom, rgba(7,7,8,0.12) 0%, rgba(7,7,8,0.24) 100%)'}}
      />
    </>
  );
}
