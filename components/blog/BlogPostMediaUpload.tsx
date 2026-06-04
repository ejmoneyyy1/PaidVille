'use client';

import {useRef, useState} from 'react';
import {ImagePlus, Video} from 'lucide-react';
import {useAdmin} from '@/contexts/AdminContext';
import {cn} from '@/lib/utils';

export default function BlogPostMediaUpload({
  documentId,
  slug,
  hasCover,
  hasVideo,
  variant = 'card',
}: {
  documentId: string;
  slug: string;
  hasCover: boolean;
  hasVideo: boolean;
  /** `card` = on blog grid cards (like events). `hero` = on article page header. */
  variant?: 'card' | 'hero';
}) {
  const {isAdmin} = useAdmin();
  const coverRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'cover' | 'video' | null>(null);

  if (!isAdmin) return null;

  async function patch(formData: FormData, kind: 'cover' | 'video') {
    setBusy(kind);
    formData.append('slug', slug);
    try {
      const res = await fetch('/api/admin/blog', {method: 'PATCH', body: formData});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(typeof data.error === 'string' ? data.error : 'Upload failed');
        return;
      }
      if (variant === 'hero') {
        window.location.assign(`/blog/${encodeURIComponent(slug)}?admin=true`);
      } else {
        window.location.reload();
      }
    } finally {
      setBusy(null);
    }
  }

  const btnClass =
    variant === 'card'
      ? 'flex items-center gap-1 rounded-full border border-charcoal/15 bg-white/95 px-2.5 py-1.5 text-[10px] font-display font-bold uppercase tracking-wide text-charcoal shadow-sm hover:bg-brand-red hover:text-white disabled:opacity-60'
      : 'flex items-center gap-1 rounded-full border border-white/25 bg-charcoal/90 px-2.5 py-1.5 text-[10px] font-display font-bold uppercase tracking-wide text-white hover:bg-brand-red disabled:opacity-60';

  const wrapClass = cn(
    'z-[15] flex gap-2',
    variant === 'card' ? 'absolute left-3 top-12 flex-row flex-wrap' : 'absolute right-5 top-14 z-20 flex-col',
  );

  return (
    <div className={wrapClass}>
      <input
        ref={coverRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const fd = new FormData();
          fd.append('documentId', documentId);
          fd.append('coverImage', file);
          void patch(fd, 'cover');
          e.target.value = '';
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const fd = new FormData();
          fd.append('documentId', documentId);
          fd.append('heroVideo', file);
          void patch(fd, 'video');
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={busy !== null}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          coverRef.current?.click();
        }}
        className={btnClass}
        title={hasCover ? 'Replace cover image' : 'Add cover image'}
      >
        <ImagePlus size={12} />
        {busy === 'cover' ? '…' : hasCover ? 'Change photo' : 'Add photo'}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          videoRef.current?.click();
        }}
        className={btnClass}
        title={hasVideo ? 'Replace hero video' : 'Add hero video'}
      >
        <Video size={12} />
        {busy === 'video' ? '…' : hasVideo ? 'Change video' : 'Add video'}
      </button>
    </div>
  );
}
