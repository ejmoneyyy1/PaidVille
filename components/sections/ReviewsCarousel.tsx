'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {motion, AnimatePresence} from 'framer-motion';
import {ChevronLeft, ChevronRight, Quote, Star} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AddReviewModal from '@/components/reviews/AddReviewModal';
import type {Review} from '@/lib/reviews';

const slideVariants = {
  enter: (dir: number) => ({x: dir > 0 ? 48 : -48, opacity: 0}),
  center: {x: 0, opacity: 1},
  exit: (dir: number) => ({x: dir > 0 ? -48 : 48, opacity: 0}),
};

function Stars({count}: {count: number}) {
  return (
    <div className="flex justify-center gap-0.5" aria-hidden>
      {Array.from({length: Math.min(5, Math.max(1, count))}).map((_, i) => (
        <Star key={i} size={16} className="fill-amber-400 text-amber-500" />
      ))}
    </div>
  );
}

export default function ReviewsCarousel({reviews}: {reviews: Review[]}) {
  const router = useRouter();
  const items = reviews;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (items.length === 0) return;
      setDirection(next > index ? 1 : -1);
      setIndex((next + items.length) % items.length);
    },
    [index, items.length],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % items.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    if (index >= items.length && items.length > 0) {
      setIndex(0);
    }
  }, [index, items.length]);

  const current = items[index];

  return (
    <>
      <section id="reviews" className="relative overflow-hidden border-t border-brand-red bg-ink py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(176,0,0,0.18) 0%, transparent 60%)',
          }}
        />

        <div className="container-max section-padding relative">
          <ScrollReveal className="mb-10 text-center">
            <span className="section-label justify-center text-white/70">Testimonials</span>
            <h2 className="section-title mt-2 text-white">
              What People <span className="text-brand-red">Are Saying</span>
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-primary mt-8 px-8 py-3 text-xs"
            >
              Add a review
            </button>
          </ScrollReveal>

          {items.length === 0 ? (
            <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-white/60">
              No reviews yet — be the first to share your experience with PaidVille.
            </p>
          ) : (
            <div className="relative mx-auto max-w-3xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.article
                  key={current._id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{duration: 0.35, ease: [0.22, 1, 0.36, 1]}}
                  className="rounded-2xl border border-brand-red/40 bg-[#B00000] px-8 py-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:px-12 md:py-12"
                >
                  <Quote size={28} className="mx-auto mb-4 text-white/40" aria-hidden />
                  <Stars count={current.rating} />
                  <p className="mt-6 font-display text-lg leading-relaxed text-white md:text-xl">
                    &ldquo;{current.comment}&rdquo;
                  </p>
                  <p className="mt-6 text-sm font-display font-bold uppercase tracking-[0.2em] text-white">
                    {current.name}
                  </p>
                </motion.article>
              </AnimatePresence>

              {items.length > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={prev}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-card/10 text-white transition-colors hover:border-brand-red hover:bg-brand-red"
                    aria-label="Previous review"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-2">
                    {items.map((item, i) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => go(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === index ? 'w-8 bg-brand-red' : 'w-2 bg-card/30 hover:bg-card/50'
                        }`}
                        aria-label={`Go to review ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={next}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-card/10 text-white transition-colors hover:border-brand-red hover:bg-brand-red"
                    aria-label="Next review"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <AddReviewModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
