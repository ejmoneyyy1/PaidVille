'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function PendingBlogPost({slug}: {slug: string}) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#1A1A1A] px-6 pb-28 pt-32 text-center">
      <p className="max-w-md text-lg font-semibold text-white">
        This post isn&apos;t visible yet (&quot;/{slug}&quot;). Sanity may still be syncing, or this URL hasn&apos;t been published.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-[2px] bg-brand-red px-6 py-3 text-sm font-bold text-white hover:bg-[#900000]"
        >
          Refresh page
        </button>
        <Link
          href="/blog/new?admin=true"
          className="rounded-[2px] border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-card/10"
        >
          New post form
        </Link>
        <Link href="/blog?admin=true" className="text-sm text-white/55 underline underline-offset-4 hover:text-white">
          Back to blog
        </Link>
      </div>
    </div>
  );
}
