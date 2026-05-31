'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Edit} from 'lucide-react';
import BlogModal from '@/components/blog/BlogModal';
import type {BlogPost} from '@/lib/blog-storage';

export default function ArticleEditButton({post}: {post: BlogPost}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute right-5 top-5 z-30 flex items-center gap-1 rounded-lg bg-charcoal/90 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-charcoal"
      >
        <Edit size={14} />
        Edit
      </button>
      {open && (
        <BlogModal
          post={post}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
