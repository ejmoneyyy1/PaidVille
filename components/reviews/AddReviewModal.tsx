'use client';

import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Star, X} from 'lucide-react';

export default function AddReviewModal({open, onClose}: {open: boolean; onClose: () => void}) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState('');

  function reset() {
    setName('');
    setRating(0);
    setHoverRating(0);
    setComment('');
    setError(null);
    setDone(false);
    setDoneMessage('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError('Please select a star rating');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name.trim(), rating, comment: comment.trim()}),
      });
      const data = (await res.json().catch(() => ({}))) as {error?: string; message?: string};
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not submit review');
        return;
      }
      setDoneMessage(
        typeof data.message === 'string'
          ? data.message
          : 'Thanks! Your review was submitted.',
      );
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const displayRating = hoverRating || rating;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[170] flex items-center justify-center bg-charcoal/50 p-4 backdrop-blur-sm"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          role="presentation"
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="add-review-title"
            className="relative w-full max-w-md overflow-y-auto rounded-2xl border border-brand-red bg-cream shadow-xl"
            initial={{scale: 0.96, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.98, opacity: 0}}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full border border-brand-red/40 p-2 text-charcoal hover:bg-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-8 pt-10">
              <p className="mb-2 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-brand-red">
                Reviews
              </p>
              <h2 id="add-review-title" className="pr-8 font-display text-2xl font-black text-charcoal">
                Leave a review
              </h2>
              <p className="mt-2 mb-6 text-sm text-charcoal/60">
                Share your real experience with PaidVille. We read every submission.
              </p>

              {done ? (
                <div className="py-6 text-center">
                  <p className="font-display text-lg font-bold text-charcoal">{doneMessage}</p>
                  <button type="button" className="btn-primary mt-8 px-8 py-3 text-xs" onClick={handleClose}>
                    Close
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={submit}>
                  <div>
                    <p className="mb-2 text-xs font-display font-semibold uppercase tracking-wide text-charcoal/70">
                      Your rating *
                    </p>
                    <div className="flex gap-1" role="group" aria-label="Star rating">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="rounded p-1 transition-transform hover:scale-110"
                          aria-label={`${value} star${value === 1 ? '' : 's'}`}
                        >
                          <Star
                            size={28}
                            className={
                              value <= displayRating
                                ? 'fill-amber-400 text-amber-500'
                                : 'fill-transparent text-charcoal/25'
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-display font-semibold uppercase tracking-wide text-charcoal/70">
                      Your name *
                    </span>
                    <input
                      className="inquiry-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First name or full name"
                      maxLength={80}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-display font-semibold uppercase tracking-wide text-charcoal/70">
                      Your review *
                    </span>
                    <textarea
                      className="inquiry-input min-h-[120px] resize-y"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What was your experience like?"
                      maxLength={2000}
                      required
                    />
                  </label>

                  {error ? <p className="text-sm text-red-600">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-primary w-full py-3 text-xs disabled:opacity-60"
                  >
                    {busy ? 'Submitting…' : 'Submit review'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
