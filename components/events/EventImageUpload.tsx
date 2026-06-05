'use client';

import {useRef, useState} from 'react';
import {ImagePlus} from 'lucide-react';
import {useAdmin} from '@/contexts/AdminContext';

export default function EventImageUpload({
  documentId,
  hasImage,
  onUploaded,
}: {
  documentId: string;
  hasImage: boolean;
  onUploaded?: () => void;
}) {
  const {isAdmin} = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!isAdmin) return null;

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('documentId', documentId);
      fd.append('image', file);
      const res = await fetch('/api/admin/event', {method: 'PATCH', body: fd});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(typeof data.error === 'string' ? data.error : 'Could not upload image');
        return;
      }
      onUploaded?.();
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="absolute left-3 top-12 z-[15] flex items-center gap-1 rounded-full border border-charcoal/15 bg-card/95 px-2.5 py-1.5 text-[10px] font-display font-bold uppercase tracking-wide text-charcoal shadow-sm hover:bg-brand-red hover:text-white disabled:opacity-60"
        title={hasImage ? 'Replace event photo' : 'Add event photo'}
      >
        <ImagePlus size={12} />
        {busy ? '…' : hasImage ? 'Change photo' : 'Add photo'}
      </button>
    </>
  );
}
