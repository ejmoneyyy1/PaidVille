'use client';

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import type {
  AdminBlogRow,
  AdminEventRow,
  AdminGalleryRow,
  AdminInquiryRow,
  AdminReviewRow,
} from '@/lib/admin-dashboard-queries';

type Tab = 'reviews' | 'inquiries' | 'content';

export default function AdminDashboardClient({
  reviews,
  inquiries,
  blogs,
  events,
  gallery,
}: {
  reviews: AdminReviewRow[];
  inquiries: AdminInquiryRow[];
  blogs: AdminBlogRow[];
  events: AdminEventRow[];
  gallery: AdminGalleryRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('reviews');
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const publishedReviews = reviews.filter((r) => r.status === 'published');

  async function setReviewStatus(documentId: string, status: 'published' | 'pending') {
    setBusyId(documentId);
    try {
      const res = await fetch('/api/admin/review', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({documentId, status}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(typeof data.error === 'string' ? data.error : 'Update failed');
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function deleteReview(documentId: string) {
    if (!window.confirm('Delete this review permanently?')) return;
    setBusyId(documentId);
    try {
      const res = await fetch('/api/admin/review', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({documentId}),
      });
      if (!res.ok) {
        alert('Could not delete review');
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function reviewDocumentId(id: string) {
    return id.replace(/^drafts\./, '');
  }

  async function logout() {
    await fetch('/api/admin/logout', {method: 'POST'});
    window.location.href = '/admin/login';
  }

  const tabs: {id: Tab; label: string; count?: number}[] = [
    {id: 'reviews', label: 'Reviews', count: pendingReviews.length},
    {id: 'inquiries', label: 'Inquiries', count: inquiries.length},
    {id: 'content', label: 'Content'},
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      <header className="border-b border-[#333] bg-[#111]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="font-display text-xl font-black tracking-wide text-brand-red">PAIDVILLE</p>
            <h1 className="text-lg font-semibold text-white/90">Site dashboard</h1>
            <p className="mt-1 text-xs text-white/45">Manage content here — no Sanity Studio required.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/?admin=true" className="rounded border border-[#444] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:border-brand-red hover:text-white">
              View site
            </Link>
            <button type="button" onClick={logout} className="rounded bg-brand-red px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#900000]">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/blog/new?admin=true" label="+ New blog post" />
          <QuickAction href="/events/new?admin=true" label="+ New event" />
          <QuickAction href="/gallery/new?admin=true" label="+ Gallery item" />
          <QuickAction href="/?admin=true" label="Edit on live site" hint="Turn Editing On in the toolbar" />
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#333] pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-t px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                tab === t.id ? 'bg-[#2A2A2A] text-brand-red' : 'text-white/50 hover:text-white'
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 ? ` (${t.count})` : ''}
            </button>
          ))}
        </div>

        {tab === 'reviews' ? (
          <div className="space-y-8">
            <ReviewSection
              title={`Pending approval (${pendingReviews.length})`}
              empty="No pending reviews."
              items={pendingReviews}
              busyId={busyId}
              onPublish={(id) => setReviewStatus(reviewDocumentId(id), 'published')}
              onDelete={(id) => deleteReview(reviewDocumentId(id))}
            />
            <ReviewSection
              title={`Published (${publishedReviews.length})`}
              empty="No published reviews yet."
              items={publishedReviews}
              busyId={busyId}
              onUnpublish={(id) => setReviewStatus(reviewDocumentId(id), 'pending')}
              onDelete={(id) => deleteReview(reviewDocumentId(id))}
              published
            />
          </div>
        ) : null}

        {tab === 'inquiries' ? (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <p className="text-sm text-white/50">No inquiries yet.</p>
            ) : (
              inquiries.map((row) => (
                <div key={row._id} className="rounded-lg border border-[#333] bg-[#222] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-red">{row.submissionType}</p>
                      <p className="mt-1 font-semibold text-white">{row.name}</p>
                      <p className="text-sm text-white/60">
                        {row.email} · {row.phone}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                  {row.formData?.json ? (
                    <pre className="mt-4 max-h-40 overflow-auto rounded bg-[#1A1A1A] p-3 text-xs text-white/70 whitespace-pre-wrap">
                      {formatInquiryJson(row.formData.json)}
                    </pre>
                  ) : null}
                </div>
              ))
            )}
          </div>
        ) : null}

        {tab === 'content' ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <ContentList title="Blog posts" empty="No posts." items={blogs.map((b) => ({id: b._id, primary: b.title, secondary: b.slug, href: `/blog/${b.slug}?admin=true`, badge: b.status}))} />
            <ContentList title="Events" empty="No events." items={events.map((e) => ({id: e._id, primary: e.eventName, secondary: e.location, href: '/events?admin=true'}))} />
            <ContentList title="Gallery" empty="No gallery items." items={gallery.map((g) => ({id: g._id, primary: g.title, secondary: g._type, href: '/gallery?admin=true'}))} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuickAction({href, label, hint}: {href: string; label: string; hint?: string}) {
  return (
    <Link href={href} className="block rounded-lg border border-[#333] bg-[#222] px-4 py-4 transition-colors hover:border-brand-red">
      <p className="text-sm font-semibold text-white">{label}</p>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </Link>
  );
}

function ReviewSection({
  title,
  empty,
  items,
  busyId,
  onPublish,
  onUnpublish,
  onDelete,
  published,
}: {
  title: string;
  empty: string;
  items: AdminReviewRow[];
  busyId: string | null;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onDelete: (id: string) => void;
  published?: boolean;
}) {
  if (items.length === 0) return <p className="text-sm text-white/50">{empty}</p>;

  return (
    <div>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-white/70">{title}</h2>
      <div className="space-y-3">
        {items.map((r) => (
          <div key={r._id} className="rounded-lg border border-[#333] bg-[#222] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{r.name}</p>
                <p className="text-sm text-amber-400">{'★'.repeat(Math.min(5, r.rating))}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">&ldquo;{r.comment}&rdquo;</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!published && onPublish ? (
                  <button
                    type="button"
                    disabled={busyId === r._id}
                    onClick={() => onPublish(r._id)}
                    className="rounded bg-brand-red px-3 py-1.5 text-xs font-semibold uppercase text-white disabled:opacity-50"
                  >
                    Publish
                  </button>
                ) : null}
                {published && onUnpublish ? (
                  <button
                    type="button"
                    disabled={busyId === r._id}
                    onClick={() => onUnpublish(r._id)}
                    className="rounded border border-[#555] px-3 py-1.5 text-xs font-semibold uppercase text-white/80 disabled:opacity-50"
                  >
                    Unpublish
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === r._id}
                  onClick={() => onDelete(r._id)}
                  className="rounded border border-[#555] px-3 py-1.5 text-xs font-semibold uppercase text-white/60 hover:text-red-400 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: {id: string; primary: string; secondary?: string; href: string; badge?: string}[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/70">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-white/50">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="block rounded border border-[#333] bg-[#222] px-3 py-3 hover:border-brand-red">
                <p className="text-sm font-medium text-white line-clamp-2">{item.primary}</p>
                {item.secondary ? <p className="text-xs text-white/45">{item.secondary}</p> : null}
                {item.badge ? <p className="mt-1 text-[10px] uppercase tracking-wide text-brand-red">{item.badge}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatInquiryJson(json: string): string {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return Object.entries(parsed)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
      .join('\n');
  } catch {
    return json;
  }
}
