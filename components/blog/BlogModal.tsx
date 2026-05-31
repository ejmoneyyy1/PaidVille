'use client';

import {useState} from 'react';
import Image from 'next/image';
import type {BlogPost} from '@/lib/blog-storage';

export default function BlogModal({
  post,
  onClose,
  onSuccess,
}: {
  post?: BlogPost;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (post?.id) {
        formData.append('id', post.id);
      }

      if (coverFile && coverFile.size > 0) {
        formData.set('coverImage', coverFile);
      } else {
        // Don't send an empty file field — keeps the current cover on edit
        formData.delete('coverImage');
      }

      const res = await fetch('/api/admin/blog', {
        method: post?.id ? 'PATCH' : 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Failed to save post');
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
            {post ? 'Edit Post' : 'Add New Post'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={post?.title ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Headline for Biased Opinions"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              URL Slug (optional)
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              defaultValue={post?.slug ?? ''}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="auto-generated from title"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="author" className="block text-xs font-semibold uppercase text-white/70 mb-1">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                defaultValue={post?.author ?? 'PaidVille'}
                className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-xs font-semibold uppercase text-white/70 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                defaultValue={post?.category ?? 'EDITORIAL'}
                className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              defaultValue={post?.excerpt ?? ''}
              rows={3}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Shows on the blog grid and previews"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Article Body
            </label>
            <textarea
              id="body"
              name="body"
              defaultValue={post?.body?.join('\n\n') ?? ''}
              rows={10}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Write your article. Separate paragraphs with a blank line."
            />
            <p className="mt-1 text-[11px] text-white/40">Separate paragraphs with a blank line.</p>
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Cover Image {post ? '(leave empty to keep current)' : '(optional)'}
            </label>
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white file:uppercase hover:file:bg-[#900000] focus:border-brand-red focus:outline-none"
            />
            {post?.coverImage && !coverFile && (
              <div className="mt-2">
                <p className="text-xs text-white/50 mb-2">Current cover:</p>
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#444]">
                  <Image src={post.coverImage} alt="Current cover" fill className="object-cover" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="heroVideoUrl" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Hero Video URL (optional)
            </label>
            <input
              type="url"
              id="heroVideoUrl"
              name="heroVideoUrl"
              defaultValue={post?.heroVideoUrl ?? ''}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="https://… direct MP4 or hosted link"
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
              {submitting ? 'Saving...' : post ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
