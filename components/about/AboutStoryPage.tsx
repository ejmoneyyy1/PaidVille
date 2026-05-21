'use client';

import {useInquiry} from '@/components/inquiry/InquiryProvider';

const STORY = [
  `PaidVille didn't start in a boardroom or from a viral post. It started with three young men who shared a vision to make the most out of an opportunity — where we're from, people would only dream of these opportunities. Late Nights, early mornings, balling on a budget, grinding, believing in something bigger than ourselves & it would turn out to be much bigger. That founding energy is still the DNA of everything we do — Carpe Diem 'seize the day'`,
  `What started as a grassroots events crew in Fayetteville has grown into a full-service lifestyle brand — touching entertainment, consulting, fashion, and community. Every event, every drop, every frame of content carries the same mission we started with: uplift our community, provide memorable experiences, and stay paid.`,
];

const MISSION =
  'Building premium experiences that elevate individuals through authentic culture and community engagement';

const STATS = [
  {label: '100+ Events'},
  {label: '10K+ Tickets'},
  {label: 'Est. 2018'},
  {label: 'Fayetteville AR'},
];

export default function AboutStoryPage() {
  const {openEvent} = useInquiry();

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative flex min-h-screen items-center justify-center bg-charcoal px-6">
        <div className="text-center">
          <p className="mb-4 text-xs font-display font-bold uppercase tracking-[0.35em] text-brand-red">
            EST. 2018 · FAYETTEVILLE, AR
          </p>
          <h1 className="font-display text-[clamp(3.5rem,14vw,9rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
            OUR STORY
          </h1>
        </div>
      </section>

      <section className="section-padding py-20 md:py-28">
        <div className="mx-auto max-w-[800px] space-y-8 text-[20px] leading-[1.8] text-charcoal/85">
          {STORY.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="bg-[#B00000] px-6 py-16 md:py-20">
        <p className="mx-auto max-w-4xl text-center font-display text-xl italic leading-relaxed text-white md:text-2xl lg:text-3xl">
          {MISSION}
        </p>
      </section>

      <section className="border-t border-brand-red/20 bg-cream py-14">
        <div className="container-max section-padding">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <p key={stat.label} className="text-center font-display text-lg font-black text-charcoal md:text-xl">
                {stat.label}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding pb-24 pt-8 text-center">
        <button type="button" onClick={() => openEvent()} className="btn-primary px-10 py-4 text-sm">
          Work With Us
        </button>
      </section>
    </div>
  );
}
