'use client';

import dynamic from 'next/dynamic';

// WebGL/Three.js must only load on the client (no SSR on the Cloudflare worker).
const CosmicBackground = dynamic(() => import('@/components/ui/CosmicBackground'), {ssr: false});
// Client-only so random meteor positions don't cause hydration mismatch.
const Meteors = dynamic(() => import('@/components/ui/Meteors'), {ssr: false});

export default function CosmicBackgroundMount() {
  return (
    <>
      <CosmicBackground />
      <Meteors number={26} />
      {/* Site-wide readability scrim: darkens the busy cosmos so content stays legible */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-[5]"
        style={{background: 'linear-gradient(to bottom, rgba(7,7,8,0.4) 0%, rgba(7,7,8,0.52) 100%)'}}
      />
    </>
  );
}
