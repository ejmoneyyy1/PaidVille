'use client';

import ScrollReveal from '@/components/ui/ScrollReveal';

export default function JoinSection() {
  return (
    <section className="relative w-full overflow-hidden bg-transparent py-28 md:py-36 border-t border-brand-red/40">
      <ScrollReveal className="relative z-10 container-max section-padding flex flex-col items-center gap-6 text-center">
        <span className="section-label justify-center">Join the Movement</span>
        <h2 className="section-title text-charcoal max-w-3xl">
          Be part of <span className="text-brand-red">PaidVille</span>
        </h2>
        <p className="max-w-xl text-charcoal/60">
          Premium events. Elevated lifestyle. Get on the list and never miss a drop.
        </p>
        <a href="#events" className="btn-primary mt-2">
          Explore Events
        </a>
      </ScrollReveal>
    </section>
  );
}
