'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {slugifyTitle} from '@/lib/slugify';

const inputCls =
  'w-full rounded-[2px] border border-charcoal/20 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40';

export default function BlogNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slugManual, setSlugManual] = useState('');
  const [author, setAuthor] = useState('PaidVille');
  const [category, setCategory] = useState('EDITORIAL');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const slugPreview = (slugManual.trim() ? slugifyTitle(slugManual) : slugifyTitle(title)) || 'your-url';

  async function submit() {
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          kind: 'blog',
          data: {
            title: title.trim(),
            slug: slugManual.trim() || undefined,
            author: author.trim(),
            category: category.trim(),
            excerpt: excerpt.trim(),
            body: body.trim(),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.replace('/admin/login?next=/blog/new');
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not create post');
        return;
      }
      if (typeof data.slug === 'string') {
        router.push(`/blog/${data.slug}?admin=true`);
        return;
      }
      setError('Unexpected response');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] pb-28 pt-24">
      <div className="container-max section-padding mx-auto max-w-lg">
        <Link
          href="/blog"
          className="inline-block text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
        >
          ← Back to Biased Opinions
        </Link>

        <div className="mt-10 flex flex-col items-center">
          <div className="relative h-16 w-16">
            <Image src="/images/splashlogo.png" alt="" fill className="object-contain" />
          </div>
          <p className="mt-6 font-display text-xl font-black tracking-[0.12em] text-white">NEW POST</p>
          <p className="mt-2 text-center text-[13px] text-white/50">Fill everything below, then publish to the blog.</p>
        </div>

        <div className="mt-12 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Title *</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              placeholder="Headline for Biased Opinions"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              URL slug (optional override)
            </span>
            <input
              type="text"
              value={slugManual}
              onChange={(e) => setSlugManual(e.target.value)}
              className={inputCls}
              placeholder={`Auto: ${slugPreview}`}
            />
            <span className="mt-2 block font-mono text-[12px] text-white/40">paidville.com/blog/{slugPreview}</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Author</span>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Category tag
              </span>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Short excerpt *
            </span>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={inputCls}
              placeholder="Shows on the blog grid and previews"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Article body (optional)
            </span>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={inputCls}
              placeholder={'Paragraphs separated by blank lines.'}
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
          {busy ? 'Publishing…' : 'Publish post'}
        </button>
      </div>
    </div>
  );
}
