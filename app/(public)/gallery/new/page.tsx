'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

const inputCls =
  'w-full rounded-[2px] border border-charcoal/20 bg-card px-4 py-3 text-charcoal placeholder:text-charcoal/40';

export default function GalleryNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      if (mediaUrl.trim()) {
        fd.append('mediaUrl', mediaUrl.trim());
      }
      if (file && file.size > 0) {
        fd.append('media', file);
      }

      const res = await fetch('/api/admin/gallery-item', {
        method: 'POST',
        body: fd,
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
      window.location.assign('/gallery?admin=true');
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
          <p className="mt-6 font-display text-xl font-black tracking-[0.12em] text-white">ADD TO GALLERY</p>
          <p className="mt-2 text-center text-[13px] text-white/55">
            Title required. Upload a photo or video from your device — or optionally add a hosted link (YouTube, Vimeo, MP4).
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
              Photo / video file (recommended)
            </span>
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,.mp4,.webm,.mov"
              className={`${inputCls} py-3 file:mr-4 file:rounded-sm file:border-0 file:bg-brand-red file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white`}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="mt-2 font-mono text-[12px] text-white/40">
                {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB max 40 MB
              </p>
            ) : (
              <p className="mt-2 text-[12px] text-white/35">JPEG, PNG, WebP, GIF, MP4 or WebM from your camera roll.</p>
            )}
          </label>

          <div className="relative py-2 text-center text-[11px] uppercase tracking-[0.2em] text-white/35">
            <span className="bg-[#1A1A1A] px-3">or</span>
          </div>

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
