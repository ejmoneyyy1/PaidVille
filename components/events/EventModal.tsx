'use client';

import {useState} from 'react';
import Image from 'next/image';
import {X, Plus} from 'lucide-react';
import type {Event} from '@/lib/event-storage';

function toDateTimeLocal(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultDateTimeLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventModal({
  event,
  onClose,
  onSuccess,
}: {
  event?: Event;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [galleryImagesToKeep, setGalleryImagesToKeep] = useState<string[]>(
    event?.galleryImages ?? []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // The event id travels with the object from the list — always present when editing
      if (event?.id) {
        formData.append('eventId', event.id);
      }

      if (imageFile && imageFile.size > 0) {
        formData.set('image', imageFile);
      } else {
        // Don't send an empty file field — keeps the current image on edit
        formData.delete('image');
      }

      // Additional gallery photos
      newGalleryFiles.forEach((file) => formData.append('galleryImages', file));
      formData.append('keepGalleryImages', JSON.stringify(galleryImagesToKeep));

      const res = await fetch('/api/admin/event', {
        method: event?.id ? 'PATCH' : 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Failed to save event');
        return;
      }

      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  const handleNewGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewGalleryFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeExistingImage = (imagePath: string) => {
    setGalleryImagesToKeep((prev) => prev.filter((p) => p !== imagePath));
  };

  const removeNewImage = (index: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
            {event ? 'Edit Event' : 'Add New Event'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="eventName" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Event Name *
            </label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              defaultValue={event?.eventName ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Show title"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              defaultValue={event ? toDateTimeLocal(event.date) : defaultDateTimeLocal()}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Venue / City *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={event?.location ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Venue name or city"
            />
          </div>

          <div>
            <label htmlFor="eventbriteUrl" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Ticket / RSVP Link *
            </label>
            <input
              type="url"
              id="eventbriteUrl"
              name="eventbriteUrl"
              defaultValue={event?.eventbriteUrl ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="https://…"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Event Photo {event ? '(leave empty to keep current)' : '(optional)'}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white file:uppercase hover:file:bg-[#900000] focus:border-brand-red focus:outline-none"
            />
            {event?.imagePath && !imageFile && (
              <div className="mt-2">
                <p className="text-xs text-white/50 mb-2">Current image:</p>
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#444]">
                  <Image src={event.imagePath} alt="Current" fill className="object-cover" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-white/70 mb-2">
              Additional Photos (optional)
            </label>

            {galleryImagesToKeep.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-white/50 mb-2">Current photos:</p>
                <div className="grid grid-cols-4 gap-2">
                  {galleryImagesToKeep.map((imagePath, index) => (
                    <div key={imagePath} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[#444]">
                        <Image src={imagePath} alt={`Photo ${index + 1}`} fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(imagePath)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newGalleryFiles.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-green-400 mb-2">New photos to add ({newGalleryFiles.length}):</p>
                <div className="grid grid-cols-4 gap-2">
                  {newGalleryFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-green-600 bg-green-900/20">
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70 p-1 text-center break-words">
                          {file.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label
              htmlFor="eventGalleryImages"
              className="flex items-center justify-center gap-2 w-full rounded border-2 border-dashed border-[#444] bg-[#222] px-4 py-3 text-sm text-white/70 hover:border-brand-red hover:text-white transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Add More Photos
            </label>
            <input
              type="file"
              id="eventGalleryImages"
              accept="image/*"
              multiple
              onChange={handleNewGalleryChange}
              className="hidden"
            />
            <p className="mt-1 text-xs text-white/40">
              Add more shots of the event. You can add multiple images.
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={event?.description ?? ''}
              rows={3}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="What to expect, dress code, etc."
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
              {submitting ? 'Saving...' : event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
