'use client';

import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {X} from 'lucide-react';
import type {InquiryMode} from '@/components/inquiry/InquiryProvider';

const eventTypes = [
  'Birthday',
  'Gala',
  'Banquet',
  'Concert',
  'Nightlife',
  'Celebration',
  'Community Service',
] as const;

const communityEventTypes = [
  'Community Cleanup',
  'Food Drive',
  'Youth Program',
  'Fundraiser',
  'Awareness Event',
  'Other',
] as const;

const eventSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Phone number is required'),
  email: z.string().email('Valid email required'),
  eventType: z.enum(eventTypes),
  eventDate: z.string().min(1, 'Event date is required'),
  eventLocation: z.string().min(2, 'Event location is required'),
  comments: z.string().optional(),
});

const brandingSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number is required'),
  industry: z.string().min(2, 'Industry is required'),
  socialHandles: z.string().optional(),
  brandingNeeds: z.string().min(4, 'Tell us about your branding needs'),
});

const communitySchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number is required'),
  organizationName: z.string().optional(),
  eventType: z.enum(communityEventTypes),
  eventDate: z.string().min(1, 'Event date is required'),
  eventLocation: z.string().min(2, 'Event location is required'),
  expectedAttendance: z.number().min(1).optional(),
  comments: z.string().optional(),
});

export type InquiryModalProps = {
  open: boolean;
  mode: InquiryMode | null;
  onClose: () => void;
};

type EventForm = z.infer<typeof eventSchema>;
type BrandingForm = z.infer<typeof brandingSchema>;
type CommunityForm = z.infer<typeof communitySchema>;

const MODE_META: Record<
  InquiryMode,
  {label: string; title: string; subtitle: string}
> = {
  event: {
    label: 'Events',
    title: 'Experience inquiry',
    subtitle: 'Tell us about your event — we will follow up within 24 hours.',
  },
  branding: {
    label: 'Branding',
    title: 'Brand elevation inquiry',
    subtitle: 'Share your brand goals and how we can help elevate your presence.',
  },
  community: {
    label: 'Community',
    title: 'Community engagement',
    subtitle: 'Partner with us on outreach, activations, and community programs.',
  },
};

export default function InquiryModal({open, mode, onClose}: InquiryModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMode = mode ?? 'event';
  const meta = MODE_META[activeMode];

  const eventForm = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      eventType: 'Celebration',
      eventDate: '',
      eventLocation: '',
      comments: '',
    },
  });

  const brandingForm = useForm<BrandingForm>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      industry: '',
      socialHandles: '',
      brandingNeeds: '',
    },
  });

  const communityForm = useForm<CommunityForm>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      organizationName: '',
      eventType: 'Community Cleanup',
      eventDate: '',
      eventLocation: '',
      expectedAttendance: undefined,
      comments: '',
    },
  });

  useEffect(() => {
    if (!open) {
      setDone(false);
      setError(null);
      eventForm.reset();
      brandingForm.reset();
      communityForm.reset();
    }
  }, [open, eventForm, brandingForm, communityForm]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  async function submitEvent() {
    const ok = await eventForm.trigger();
    if (!ok) return;
    const v = eventForm.getValues();
    await postInquiry('event', v.name, v.email, v.phone, {
      eventType: v.eventType,
      eventDate: v.eventDate,
      eventLocation: v.eventLocation,
      additionalComments: v.comments ?? '',
    });
  }

  async function submitBranding() {
    const ok = await brandingForm.trigger();
    if (!ok) return;
    const v = brandingForm.getValues();
    await postInquiry('branding', v.name, v.email, v.phone, {
      industry: v.industry,
      socialMediaOrWebsite: v.socialHandles ?? '',
      brandingNeeds: v.brandingNeeds,
    });
  }

  async function submitCommunity() {
    const ok = await communityForm.trigger();
    if (!ok) return;
    const v = communityForm.getValues();
    await postInquiry('community', v.name, v.email, v.phone, {
      organizationName: v.organizationName ?? '',
      eventType: v.eventType,
      eventDate: v.eventDate,
      eventLocation: v.eventLocation,
      expectedAttendance: v.expectedAttendance ?? null,
      additionalComments: v.comments ?? '',
    });
  }

  async function postInquiry(
    submissionType: InquiryMode,
    name: string,
    email: string,
    phone: string,
    formData: Record<string, unknown>,
  ) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({submissionType, name, email, phone, formData}),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Submit failed');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit() {
    if (activeMode === 'event') return submitEvent();
    if (activeMode === 'branding') return submitBranding();
    return submitCommunity();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm"
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
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-pv-red bg-cream shadow-xl"
            initial={{scale: 0.96, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.98, opacity: 0}}
            transition={{duration: 0.28, ease: [0.22, 1, 0.36, 1]}}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full border border-pv-red/40 p-2 text-charcoal transition-colors hover:bg-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-8 pt-10">
              <p className="mb-2 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-brand-red">
                {meta.label}
              </p>
              <h2 id="inquiry-title" className="pr-10 font-display text-2xl font-black text-charcoal">
                {meta.title}
              </h2>
              <p className="mt-2 mb-6 text-sm text-charcoal/60">{meta.subtitle}</p>

              {done ? (
                <motion.div
                  initial={{scale: 0.92, opacity: 0}}
                  animate={{scale: 1, opacity: 1}}
                  transition={{type: 'spring', stiffness: 320, damping: 22}}
                  className="py-10 text-center"
                >
                  <p className="font-display text-lg font-bold text-charcoal">
                    We&apos;ll be in touch within 24 hours.
                  </p>
                  <button type="button" className="btn-primary mt-8 px-8 py-3 text-xs" onClick={onClose}>
                    Close
                  </button>
                </motion.div>
              ) : activeMode === 'event' ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit();
                  }}
                >
                  <Field label="Full Name" error={eventForm.formState.errors.name?.message}>
                    <input className="inquiry-input" {...eventForm.register('name')} />
                  </Field>
                  <Field label="Phone Number" error={eventForm.formState.errors.phone?.message}>
                    <input className="inquiry-input" type="tel" {...eventForm.register('phone')} />
                  </Field>
                  <Field label="Email" error={eventForm.formState.errors.email?.message}>
                    <input className="inquiry-input" type="email" {...eventForm.register('email')} />
                  </Field>
                  <Field label="Event Type" error={eventForm.formState.errors.eventType?.message}>
                    <select className="inquiry-input" {...eventForm.register('eventType')}>
                      {eventTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Event Date" error={eventForm.formState.errors.eventDate?.message}>
                    <input className="inquiry-input" type="date" {...eventForm.register('eventDate')} />
                  </Field>
                  <Field label="Event Location" error={eventForm.formState.errors.eventLocation?.message}>
                    <input className="inquiry-input" {...eventForm.register('eventLocation')} />
                  </Field>
                  <Field label="Additional Comments">
                    <textarea
                      className="inquiry-input min-h-[100px] resize-y"
                      {...eventForm.register('comments')}
                    />
                  </Field>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <SubmitRow submitting={submitting} />
                </form>
              ) : activeMode === 'branding' ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit();
                  }}
                >
                  <Field label="Full Name" error={brandingForm.formState.errors.name?.message}>
                    <input className="inquiry-input" {...brandingForm.register('name')} />
                  </Field>
                  <Field label="Email" error={brandingForm.formState.errors.email?.message}>
                    <input className="inquiry-input" type="email" {...brandingForm.register('email')} />
                  </Field>
                  <Field label="Phone Number" error={brandingForm.formState.errors.phone?.message}>
                    <input className="inquiry-input" type="tel" {...brandingForm.register('phone')} />
                  </Field>
                  <Field label="Industry" error={brandingForm.formState.errors.industry?.message}>
                    <input className="inquiry-input" {...brandingForm.register('industry')} />
                  </Field>
                  <Field label="Social Media / Website Handles">
                    <input
                      className="inquiry-input"
                      placeholder="@handle or website URL"
                      {...brandingForm.register('socialHandles')}
                    />
                  </Field>
                  <Field label="Branding Needs" error={brandingForm.formState.errors.brandingNeeds?.message}>
                    <textarea
                      className="inquiry-input min-h-[110px] resize-y"
                      placeholder="Tell us about your brand and what you need..."
                      {...brandingForm.register('brandingNeeds')}
                    />
                  </Field>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <SubmitRow submitting={submitting} />
                </form>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit();
                  }}
                >
                  <Field label="Full Name" error={communityForm.formState.errors.name?.message}>
                    <input className="inquiry-input" {...communityForm.register('name')} />
                  </Field>
                  <Field label="Email" error={communityForm.formState.errors.email?.message}>
                    <input className="inquiry-input" type="email" {...communityForm.register('email')} />
                  </Field>
                  <Field label="Phone Number" error={communityForm.formState.errors.phone?.message}>
                    <input className="inquiry-input" type="tel" {...communityForm.register('phone')} />
                  </Field>
                  <Field label="Organization Name">
                    <input className="inquiry-input" {...communityForm.register('organizationName')} />
                  </Field>
                  <Field label="Event Type" error={communityForm.formState.errors.eventType?.message}>
                    <select className="inquiry-input" {...communityForm.register('eventType')}>
                      {communityEventTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Event Date" error={communityForm.formState.errors.eventDate?.message}>
                    <input className="inquiry-input" type="date" {...communityForm.register('eventDate')} />
                  </Field>
                  <Field label="Event Location" error={communityForm.formState.errors.eventLocation?.message}>
                    <input className="inquiry-input" {...communityForm.register('eventLocation')} />
                  </Field>
                  <Field label="Expected Attendance" error={communityForm.formState.errors.expectedAttendance?.message}>
                    <input
                      className="inquiry-input"
                      type="number"
                      min={0}
                      {...communityForm.register('expectedAttendance', {
                        setValueAs: (v) => {
                          if (v === '' || v === null || v === undefined) return undefined;
                          const n = Number(v);
                          return Number.isFinite(n) ? n : undefined;
                        },
                      })}
                    />
                  </Field>
                  <Field label="Additional Comments">
                    <textarea
                      className="inquiry-input min-h-[100px] resize-y"
                      {...communityForm.register('comments')}
                    />
                  </Field>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <SubmitRow submitting={submitting} />
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubmitRow({submitting}: {submitting: boolean}) {
  return (
    <button type="submit" className="btn-primary mt-4 w-full py-3 text-xs disabled:opacity-60" disabled={submitting}>
      {submitting ? 'Sending…' : 'Submit'}
    </button>
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
      <label className="mb-1.5 block text-xs font-display font-semibold uppercase tracking-wide text-charcoal/70">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
