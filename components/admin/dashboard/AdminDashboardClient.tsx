'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {formatPrice} from '@/lib/utils';
import type {ShopProduct} from '@/lib/shop-storage';
import type {
  AdminBlogRow,
  AdminEventRow,
  AdminGalleryRow,
  AdminInquiryRow,
  AdminReviewRow,
} from '@/lib/admin-dashboard-queries';
import type {SiteContentDoc} from '@/lib/sanity-queries';

type Tab = 'reviews' | 'inquiries' | 'content' | 'shop' | 'settings';

export default function AdminDashboardClient({
  reviews,
  inquiries,
  blogs,
  events,
  gallery,
  shopProducts,
  siteContent,
}: {
  reviews: AdminReviewRow[];
  inquiries: AdminInquiryRow[];
  blogs: AdminBlogRow[];
  events: AdminEventRow[];
  gallery: AdminGalleryRow[];
  shopProducts: ShopProduct[];
  siteContent?: SiteContentDoc | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('reviews');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [editingShopProduct, setEditingShopProduct] = useState<ShopProduct | null>(null);

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

  async function deleteShopProduct(productId: string) {
    if (!window.confirm('Delete this product permanently?')) return;
    setBusyId(productId);
    try {
      const res = await fetch('/api/admin/shop', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({productId}),
      });
      if (!res.ok) {
        alert('Could not delete product');
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function openShopModal(product?: ShopProduct) {
    setEditingShopProduct(product ?? null);
    setShowShopModal(true);
  }

  function closeShopModal() {
    setShowShopModal(false);
    setEditingShopProduct(null);
  }

  const tabs: {id: Tab; label: string; count?: number}[] = [
    {id: 'reviews', label: 'Reviews', count: pendingReviews.length},
    {id: 'inquiries', label: 'Inquiries', count: inquiries.length},
    {id: 'shop', label: 'Shop', count: shopProducts.length},
    {id: 'content', label: 'Content'},
    {id: 'settings', label: 'Site Settings'},
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
          <button
            type="button"
            onClick={() => openShopModal()}
            className="block rounded-lg border border-[#333] bg-[#222] px-4 py-4 transition-colors hover:border-brand-red text-left"
          >
            <p className="text-sm font-semibold text-white">+ New shop product</p>
          </button>
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

        {tab === 'shop' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-white/70">
                Shop Products ({shopProducts.length})
              </h2>
              <button
                type="button"
                onClick={() => openShopModal()}
                className="rounded bg-brand-red px-4 py-2 text-xs font-semibold uppercase text-white hover:bg-[#900000]"
              >
                + Add Product
              </button>
            </div>
            {shopProducts.length === 0 ? (
              <p className="text-sm text-white/50">No products yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shopProducts.map((product) => (
                  <div key={product.id} className="rounded-lg border border-[#333] bg-[#222] p-4">
                    {product.imagePath ? (
                      <div className="relative aspect-square mb-3 rounded overflow-hidden bg-card">
                        <Image
                          src={product.imagePath}
                          alt={product.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square mb-3 rounded bg-[#333] flex items-center justify-center">
                        <span className="text-white/30 text-xs">No image</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-white text-sm">{product.productName}</h3>
                        <span className="font-bold text-brand-red text-sm whitespace-nowrap">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-white/60 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-1 rounded ${
                            product.isAvailable ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => openShopModal(product)}
                          disabled={busyId === product.id}
                          className="flex-1 rounded border border-[#555] px-3 py-1.5 text-xs font-semibold uppercase text-white/80 hover:border-brand-red disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteShopProduct(product.id)}
                          disabled={busyId === product.id}
                          className="flex-1 rounded border border-[#555] px-3 py-1.5 text-xs font-semibold uppercase text-white/60 hover:text-red-400 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

        {tab === 'settings' ? (
          <SiteSettingsPanel siteContent={siteContent ?? null} onSaved={() => router.refresh()} />
        ) : null}
      </div>

      {showShopModal && (
        <ShopProductModal
          product={editingShopProduct}
          onClose={closeShopModal}
          onSuccess={() => {
            closeShopModal();
            router.refresh();
          }}
        />
      )}
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

function VideoUploadCard({
  label,
  description,
  field,
  currentUrl,
  defaultSrc,
  onUploaded,
}: {
  label: string;
  description: string;
  field: 'heroVideoUrl' | 'splashVideoUrl';
  currentUrl: string | null | undefined;
  defaultSrc: string;
  onUploaded: () => void;
}) {
  const activeUrl = currentUrl || defaultSrc;
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError('');
    setSavedMsg('');
    try {
      const fd = new FormData();
      fd.append('field', field);
      fd.append('video', file);
      const res = await fetch('/api/admin/site-content', {method: 'POST', body: fd});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Upload failed');
        return;
      }
      setSavedMsg('Uploaded ✓');
      setTimeout(() => setSavedMsg(''), 3000);
      onUploaded();
    } catch {
      setError('Network error — try again');
    } finally {
      setUploading(false);
    }
  }

  async function handleClear() {
    if (!currentUrl) return;
    if (!window.confirm('Remove custom video and revert to the default?')) return;
    setError('');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({field}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Failed');
        return;
      }
      onUploaded();
    } catch {
      setError('Network error');
    }
  }

  return (
    <div className="rounded-lg border border-[#333] bg-[#222] overflow-hidden">
      {/* Video preview */}
      <video
        key={activeUrl}
        src={activeUrl}
        className="w-full aspect-video object-cover bg-black"
        muted
        playsInline
        preload="metadata"
        controls={false}
        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
      />

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-white/45 mt-0.5">{description}</p>
          </div>
          {currentUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 text-[11px] text-white/35 hover:text-red-400 transition-colors"
            >
              Revert to default
            </button>
          )}
        </div>

        <p className="text-[11px] text-white/35 truncate">
          {currentUrl ? `Custom: ${currentUrl.split('/').pop()}` : 'Using default video'}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded bg-brand-red py-2 text-xs font-semibold uppercase text-white hover:bg-[#900000] disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading…' : savedMsg || 'Upload New Video'}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}
        <p className="text-[10px] text-white/25">MP4, WebM, or MOV · max 40 MB</p>
      </div>
    </div>
  );
}

function SiteSettingsPanel({
  siteContent,
  onSaved,
}: {
  siteContent: SiteContentDoc | null;
  onSaved: () => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-white/70">Videos</h2>
        <p className="mb-6 text-xs text-white/40">
          Hover a card to preview. Upload a new file to replace — reverts to the built-in default if cleared.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <VideoUploadCard
            label="Hero Background Video"
            description="Plays behind the headline on the homepage."
            field="heroVideoUrl"
            currentUrl={siteContent?.heroVideoUrl}
            defaultSrc="/videos/lights.mp4"
            onUploaded={onSaved}
          />
          <VideoUploadCard
            label="Splash / Intro Video"
            description="Plays during the loading intro sequence."
            field="splashVideoUrl"
            currentUrl={siteContent?.splashVideoUrl}
            defaultSrc="/videos/lights.mp4"
            onUploaded={onSaved}
          />
        </div>
      </div>
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

function ShopProductModal({
  product,
  onClose,
  onSuccess,
}: {
  product: ShopProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (product?.id) {
        formData.append('productId', product.id);
      }

      const res = await fetch('/api/admin/shop', {
        method: product?.id ? 'PATCH' : 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Failed to save product');
        return;
      }

      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-lg bg-[#1A1A1A] border border-[#333]">
        <div className="border-b border-[#333] px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="productName" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              defaultValue={product?.productName ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="e.g., PaidVille Summer Tee"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ''}
              rows={3}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Brief product description"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              defaultValue={product?.price ? (product.price / 100).toFixed(2) : ''}
              required
              min="0"
              step="0.01"
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="29.99"
            />
            <p className="mt-1 text-xs text-white/40">Enter in dollars (e.g., 45.00)</p>
          </div>

          <div>
            <label htmlFor="paymentLink" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Payment Link *
            </label>
            <input
              type="url"
              id="paymentLink"
              name="paymentLink"
              defaultValue={product?.paymentLink ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="https://buy.stripe.com/..."
            />
            <p className="mt-1 text-xs text-white/40">Stripe, PayPal, or any checkout link</p>
          </div>

          <div>
            <label htmlFor="image" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Product Image {!product && '*'}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              required={!product}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white file:uppercase hover:file:bg-[#900000] focus:border-brand-red focus:outline-none"
            />
            {product?.imagePath && (
              <p className="mt-1 text-xs text-white/50">Leave empty to keep current image</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              defaultChecked={product?.isAvailable ?? true}
              value="true"
              className="h-4 w-4 rounded border-[#444] bg-[#222] text-brand-red focus:ring-brand-red"
            />
            <label htmlFor="isAvailable" className="text-sm text-white">
              Available for purchase
            </label>
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
              {submitting ? 'Saving...' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
