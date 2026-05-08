'use client';

import AdminDeleteControl from '@/components/admin/AdminDeleteControl';

export default function ArticleAdminBar({documentId}: {documentId: string}) {
  return (
    <AdminDeleteControl
      documentId={documentId}
      entityLabel="this post"
      redirectAfterDelete="/blog"
      className="absolute right-5 top-5 z-[25] flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-md backdrop-blur-sm hover:bg-brand-red hover:border-brand-red"
    />
  );
}
