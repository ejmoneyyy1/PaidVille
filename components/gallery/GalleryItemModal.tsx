'use client';

import {useState} from 'react';
import Image from 'next/image';
import type {GalleryItem} from '@/lib/gallery-storage';

const CHANNEL_OPTIONS: {value: string; label: string}[] = [
  {value: 'homepage_gallery', label: 'Homepage strip'},
  {value: 'gallery_page', label: 'Gallery page'},
];

export default function GalleryItemModal({
  item,
  onClose,
  onSuccess,
}: {
  item?: GalleryItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>(item?.mediaType ?? 'photo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState(
    item?.mediaType === 'video' && item.videoPath && !item.videoPath.startsWith('/gallery/')
      ? item.videoPath
      : '',
  );
  const [channels, setChannels] = useState<string[]>(
    item?.channels?.length ? item.channels : ['homepage_gallery', 'gallery_page'],
  );

  const toggleChannel = (value: string) => {
    setChannels((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      const titleEl = (e.currentTarget.elements.namedItem('title') as HTMLInputElement);
      formData.set('title', titleEl?.value?.trim() ?? '');
      formData.set('mediaType', mediaType);
      formData.set('channels', JSON.stringify(channels));

      const orderEl = e.currentTarget.elements.namedItem('order') as HTMLInputElement | null;
      if (orderEl && orderEl.value.trim()) {
        formData.set('order', orderEl.value.trim());
      }

      if (item?.id) {
        formData.set('id', item.id);
      }

      if (mediaType === 'photo') {
        if (imageFile && imageFile.size > 0) {
          formData.set('image', imageFile);
        } else if (!item) {
          setError('Add a photo to upload');
          setSubmitting(false);
          return;
        }
      } else {
        if (videoFile && videoFile.size > 0) {
          formData.set('video', videoFile);
        } else if (videoUrl.trim()) {
          formData.set('videoUrl', videoUrl.trim());
        } else if (!item) {
          setError('Add a video file or a video URL');
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch('/api/admin/gallery-item', {
        method: item?.id ? 'PATCH' : 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Failed to save gallery item');
        return;
      }

      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-[#1A1A1A] border border-[#333] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#333] px-6 py-4 sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-lg font-bold text-white">
            {item ? 'Edit Gallery Item' : 'Add to Gallery'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Title / Caption *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={item?.title ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="What's in this shot?"
            />
          </div>

          <div>
            <label htmlFor="mediaType" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Media Type *
            </label>
            <select
              id="mediaType"
              name="mediaType"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as 'photo' | 'video')}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white focus:border-brand-red focus:outline-none"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </div>

          {mediaType === 'photo' ? (
            <div>
              <label htmlFor="image" className="block text-xs font-semibold uppercase text-white/70 mb-1">
                Photo {item ? '(leave empty to keep current)' : '*'}
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white file:uppercase hover:file:bg-[#900000] focus:border-brand-red focus:outline-none"
              />
              {item?.imagePath && !imageFile && (
                <div className="mt-2">
                  <p className="text-xs text-white/50 mb-2">Current image:</p>
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#444]">
                    <Image src={item.imagePath} alt="Current" fill className="object-cover" />
                  </div>
                </div>
              )}
              <p className="mt-2 text-[11px] text-white/40">JPG, PNG, WebP, or GIF — under 12MB.</p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="video" className="block text-xs font-semibold uppercase text-white/70 mb-1">
                  Video File {item ? '(leave empty to keep current)' : '(upload or use URL below)'}
                </label>
                <input
                  type="file"
                  id="video"
                  name="video"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white file:uppercase hover:file:bg-[#900000] focus:border-brand-red focus:outline-none"
                />
                <p className="mt-2 text-[11px] text-white/40">MP4, WebM, or MOV — under 60MB.</p>
                {item?.videoPath && item.videoPath.startsWith('/gallery/') && !videoFile && (
                  <p className="mt-2 font-mono text-[11px] text-white/40">Current: {item.videoPath}</p>
                )}
              </div>

              <div>
                <label htmlFor="videoUrl" className="block text-xs font-semibold uppercase text-white/70 mb-1">
                  Or Video URL (external)
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
                  placeholder="https://…"
                />
              </div>
            </>
          )}

          <div>
            <span className="block text-xs font-semibold uppercase text-white/70 mb-2">Show On</span>
            <div className="flex flex-wrap gap-4">
              {CHANNEL_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={channels.includes(opt.value)}
                    onChange={() => toggleChannel(opt.value)}
                    className="h-4 w-4 accent-brand-red"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="order" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Display Order (lower shows first)
            </label>
            <input
              type="number"
              id="order"
              name="order"
              defaultValue={item?.order ?? 0}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white focus:border-brand-red focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded border border-red-900 bg-red-900/20 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded border border-[#555] px-4 py-2 text-sm font-semibold uppercase text-white/80 hover:border-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-brand-red px-4 py-2 text-sm font-semibold uppercase text-white hover:bg-[#900000] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
