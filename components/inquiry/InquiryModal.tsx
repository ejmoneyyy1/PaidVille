'use client';

import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {X} from 'lucide-react';

const eventTypes = ['Corporate', 'Wedding', 'Concert', 'Festival', 'Private Party', 'Other'] as const;

const eventStep1 = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone is required'),
});

const eventStep2 = z.object({
  eventType: z.enum(eventTypes),
  serviceNeeded: z.enum(['coordination', 'promotion', 'both']),
  attendees: z.number().min(1, 'Enter expected attendees'),
});

const eventStep3 = z.object({
  dateStart: z.string().min(1, 'Start date'),
  dateEnd: z.string().min(1, 'End date'),
  notes: z.string().optional(),
});

const brandingStep1 = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone is required'),
  brandName: z.string().min(2, 'Brand name is required'),
});

const brandingStep2 = z.object({
  contentCreation: z.boolean().optional(),
  socialMedia: z.boolean().optional(),
  website: z.boolean().optional(),
  analytics: z.boolean().optional(),
  productBranding: z.boolean().optional(),
});

const brandingStep3 = z.object({
  brandGoals: z.string().min(4, 'Tell us about your goals'),
  ig: z.string().optional(),
  tiktok: z.string().optional(),
  otherSocials: z.string().optional(),
});

export type InquiryModalProps = {
  open: boolean;
  /** When `open` is false, pass `null`. When open, must be `'event'` or `'branding'`. */
  mode: 'event' | 'branding' | null;
  onClose: () => void;
};

type EventForm = z.infer<typeof eventStep1> & z.infer<typeof eventStep2> & z.infer<typeof eventStep3>;
type BrandingForm = z.infer<typeof brandingStep1> & z.infer<typeof brandingStep2> & z.infer<typeof brandingStep3>;

const slide = {
  initial: {x: 28, opacity: 0},
  animate: {x: 0, opacity: 1},
  exit: {x: -28, opacity: 0},
  transition: {duration: 0.28, ease: [0.22, 1, 0.36, 1] as const},
};

export default function InquiryModal({open, mode, onClose}: InquiryModalProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMode = mode ?? 'event';

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const eventForm = useForm<EventForm>({
    resolver: zodResolver(eventStep1.merge(eventStep2).merge(eventStep3)),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      eventType: 'Corporate',
      serviceNeeded: 'both',
      attendees: 100,
      dateStart: '',
      dateEnd: '',
      notes: '',
    },
  });

  const brandingForm = useForm<BrandingForm>({
    resolver: zodResolver(brandingStep1.merge(brandingStep2).merge(brandingStep3)),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      brandName: '',
      contentCreation: false,
      socialMedia: false,
      website: false,
      analytics: false,
      productBranding: false,
      brandGoals: '',
      ig: '',
      tiktok: '',
      otherSocials: '',
    },
  });

  useEffect(() => {
    if (!open) {
      setStep(0);
      setDone(false);
      setError(null);
      eventForm.reset();
      brandingForm.reset();
    }
  }, [open, eventForm, brandingForm]);

  async function validateAndNextEvent() {
    setError(null);
    if (step === 0) {
      const ok = await eventForm.trigger(['name', 'email', 'phone']);
      if (ok) setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await eventForm.trigger(['eventType', 'serviceNeeded', 'attendees']);
      if (ok) setStep(2);
      return;
    }
  }

  async function validateAndNextBranding() {
    setError(null);
    if (step === 0) {
      const ok = await brandingForm.trigger(['name', 'email', 'phone', 'brandName']);
      if (ok) setStep(1);
      return;
    }
    if (step === 1) {
      const v = brandingForm.getValues();
      const anyService =
        v.contentCreation || v.socialMedia || v.website || v.analytics || v.productBranding;
      if (!anyService) {
        setError('Select at least one service.');
        return;
      }
      setStep(2);
      return;
    }
  }

  async function submitEvent() {
    const ok = await eventForm.trigger(['dateStart', 'dateEnd', 'notes']);
    if (!ok) return;
    setSubmitting(true);
    setError(null);
    const v = eventForm.getValues();
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          submissionType: 'event',
          name: v.name,
          email: v.email,
          phone: v.phone,
          formData: {
            eventType: v.eventType,
            serviceNeeded: v.serviceNeeded,
            attendees: v.attendees,
            preferredDates: {start: v.dateStart, end: v.dateEnd},
            notes: v.notes ?? '',
          },
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Submit failed');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitBranding() {
    const ok = await brandingForm.trigger(['brandGoals', 'ig', 'tiktok', 'otherSocials']);
    if (!ok) return;
    setSubmitting(true);
    setError(null);
    const v = brandingForm.getValues();
    const services: string[] = [];
    if (v.contentCreation) services.push('Content Creation');
    if (v.socialMedia) services.push('Social Media Management');
    if (v.website) services.push('Website');
    if (v.analytics) services.push('Analytics');
    if (v.productBranding) services.push('Product Branding');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          submissionType: 'branding',
          name: v.name,
          email: v.email,
          phone: v.phone,
          formData: {
            brandName: v.brandName,
            services,
            brandGoals: v.brandGoals,
            instagram: v.ig ?? '',
            tiktok: v.tiktok ?? '',
            otherSocials: v.otherSocials ?? '',
          },
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Submit failed');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const maxStep = 2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.25}}
          role="presentation"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="inquiry-title"
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-pv-red bg-cream shadow-xl"
            initial={{scale: 0.96, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.98, opacity: 0}}
            transition={{duration: 0.28, ease: [0.22, 1, 0.36, 1]}}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full border border-pv-red/40 text-charcoal hover:bg-white transition-colors z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-8 pt-10">
              <p className="text-[10px] font-display font-bold tracking-[0.2em] uppercase text-brand-red mb-2">
                {activeMode === 'event' ? 'Events' : 'Branding'}
              </p>
              <h2 id="inquiry-title" className="font-display font-black text-2xl text-charcoal pr-10">
                {activeMode === 'event' ? 'Experience inquiry' : 'Brand elevation inquiry'}
              </h2>
              <p className="text-sm text-charcoal/60 mt-2 mb-6">
                Step {step + 1} of {maxStep + 1}
              </p>

              {done ? (
                <motion.div
                  initial={{scale: 0.92, opacity: 0}}
                  animate={{scale: 1, opacity: 1}}
                  transition={{type: 'spring', stiffness: 320, damping: 22}}
                  className="py-10 text-center"
                >
                  <p className="font-display font-bold text-lg text-charcoal">
                    We&apos;ll be in touch within 24 hours.
                  </p>
                  <button type="button" className="mt-8 btn-primary text-xs py-3 px-8" onClick={onClose}>
                    Close
                  </button>
                </motion.div>
              ) : activeMode === 'event' ? (
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="e0" {...slide} className="space-y-4">
                      <Field label="Full name" error={eventForm.formState.errors.name?.message}>
                        <input
                          className="inquiry-input"
                          {...eventForm.register('name')}
                        />
                      </Field>
                      <Field label="Email" error={eventForm.formState.errors.email?.message}>
                        <input className="inquiry-input" type="email" {...eventForm.register('email')} />
                      </Field>
                      <Field label="Phone" error={eventForm.formState.errors.phone?.message}>
                        <input className="inquiry-input" type="tel" {...eventForm.register('phone')} />
                      </Field>
                    </motion.div>
                  )}
                  {step === 1 && (
                    <motion.div key="e1" {...slide} className="space-y-4">
                      <Field label="Event type" error={eventForm.formState.errors.eventType?.message}>
                        <select className="inquiry-input" {...eventForm.register('eventType')}>
                          {eventTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Service needed" error={eventForm.formState.errors.serviceNeeded?.message}>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              {v: 'coordination', l: 'Coordination'},
                              {v: 'promotion', l: 'Promotion'},
                              {v: 'both', l: 'Both'},
                            ] as const
                          ).map(({v, l}) => (
                            <label
                              key={v}
                              className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-display font-semibold uppercase tracking-wide transition-colors ${
                                eventForm.watch('serviceNeeded') === v
                                  ? 'border-brand-red bg-brand-red text-white'
                                  : 'border-brand-red bg-white text-charcoal hover:bg-white/90'
                              }`}
                            >
                              <input type="radio" className="sr-only" value={v} {...eventForm.register('serviceNeeded')} />
                              {l}
                            </label>
                          ))}
                        </div>
                      </Field>
                      <Field label="Expected # of attendees" error={eventForm.formState.errors.attendees?.message}>
                        <input
                          className="inquiry-input"
                          type="number"
                          min={1}
                          {...eventForm.register('attendees', {valueAsNumber: true})}
                        />
                      </Field>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="e2" {...slide} className="space-y-4">
                      <Field label="Preferred start" error={eventForm.formState.errors.dateStart?.message}>
                        <input className="inquiry-input" type="date" {...eventForm.register('dateStart')} />
                      </Field>
                      <Field label="Preferred end" error={eventForm.formState.errors.dateEnd?.message}>
                        <input className="inquiry-input" type="date" {...eventForm.register('dateEnd')} />
                      </Field>
                      <Field label="Additional notes">
                        <textarea className="inquiry-input min-h-[100px] resize-y" {...eventForm.register('notes')} />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="b0" {...slide} className="space-y-4">
                      <Field label="Full name" error={brandingForm.formState.errors.name?.message}>
                        <input className="inquiry-input" {...brandingForm.register('name')} />
                      </Field>
                      <Field label="Email" error={brandingForm.formState.errors.email?.message}>
                        <input className="inquiry-input" type="email" {...brandingForm.register('email')} />
                      </Field>
                      <Field label="Phone" error={brandingForm.formState.errors.phone?.message}>
                        <input className="inquiry-input" type="tel" {...brandingForm.register('phone')} />
                      </Field>
                      <Field label="Brand name" error={brandingForm.formState.errors.brandName?.message}>
                        <input className="inquiry-input" {...brandingForm.register('brandName')} />
                      </Field>
                    </motion.div>
                  )}
                  {step === 1 && (
                    <motion.div key="b1" {...slide} className="space-y-3">
                      <p className="text-xs font-display font-semibold uppercase tracking-wide text-charcoal/70">
                        Service needed
                      </p>
                      {[
                        ['contentCreation', 'Content Creation'],
                        ['socialMedia', 'Social Media Management'],
                        ['website', 'Website'],
                        ['analytics', 'Analytics'],
                        ['productBranding', 'Product Branding'],
                      ].map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 rounded-xl border border-brand-red px-4 py-3 cursor-pointer bg-white"
                        >
                          <input
                            type="checkbox"
                            className="accent-brand-red"
                            {...brandingForm.register(key as 'contentCreation' | 'socialMedia' | 'website' | 'analytics' | 'productBranding', {
                              setValueAs: (v) => v === true || v === 'on',
                            })}
                          />
                          <span className="text-sm text-charcoal">{label}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="b2" {...slide} className="space-y-4">
                      <Field label="Brand goals" error={brandingForm.formState.errors.brandGoals?.message}>
                        <textarea className="inquiry-input min-h-[110px] resize-y" {...brandingForm.register('brandGoals')} />
                      </Field>
                      <Field label="Instagram">
                        <input className="inquiry-input" {...brandingForm.register('ig')} />
                      </Field>
                      <Field label="TikTok">
                        <input className="inquiry-input" {...brandingForm.register('tiktok')} />
                      </Field>
                      <Field label="Other socials">
                        <input className="inquiry-input" {...brandingForm.register('otherSocials')} />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

              {!done && (
                <div className="flex gap-3 mt-8">
                  {step > 0 && (
                    <button
                      type="button"
                      className="btn-secondary flex-1 text-xs py-3"
                      onClick={() => {
                        setStep((s) => Math.max(0, s - 1));
                        setError(null);
                      }}
                    >
                      Back
                    </button>
                  )}
                  {step < maxStep ? (
                    <button
                      type="button"
                      className="btn-primary flex-1 text-xs py-3"
                      onClick={activeMode === 'event' ? validateAndNextEvent : validateAndNextBranding}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary flex-1 text-xs py-3 disabled:opacity-60"
                      disabled={submitting}
                      onClick={activeMode === 'event' ? submitEvent : submitBranding}
                    >
                      {submitting ? 'Sending…' : 'Submit'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-display font-semibold uppercase tracking-wide text-charcoal/70 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
