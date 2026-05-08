'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

const inputCls =
  'w-full rounded-[2px] border border-charcoal/20 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40';

export default function GalleryNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          kind: 'galleryItem',
          data: {
            title: title.trim(),
            mediaUrl: mediaUrl.trim() || undefined,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.replace('/admin/login?next=/gallery/new');
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not add to gallery');
        return;
      }
      router.push('/gallery?admin=true');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] pb-28 pt-24">
      <div className="container-max section-padding mx-auto max-w-lg">
        <Link
          href="/gallery"
          className="inline-block text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
        >
          ← Gallery
        </Link>

        <div className="mt-10 flex flex-col items-center">
          <div className="relative h-16 w-16">
            <Image src="/images/splashlogo.png" alt="" fill className="object-contain" />
          </div>
          <p className="mt-6 font-display text-xl font-black tracking-[0.12em] text-white">NEW GALLERY ITEM</p>
          <p className="mt-2 text-center text-[13px] text-white/50">
            Title required. Optionally paste a hosted MP4 / WebM or YouTube / Vimeo URL. Otherwise add imagery later in Sanity.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Caption / title *
            </span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Media URL (optional)
            </span>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
          </label>
        </div>

        {error ? <p className="mt-6 text-center text-sm text-brand-red">{error}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="mt-8 w-full rounded-[2px] bg-brand-red py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#900000] disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Add to gallery'}
        </button>
      </div>
    </div>
  );
}
