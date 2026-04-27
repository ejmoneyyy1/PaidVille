import Link from 'next/link';
import { Calendar, ArrowUpRight, Tag } from 'lucide-react';
import type { BlogPost } from '@/components/sections/BlogPreview';

export default function BlogCard({ post }: { post: BlogPost }) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block rounded-2xl overflow-hidden card-glass card-glass-hover"
    >
      {/* Image placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-brand-muted to-brand-card-surface
        flex items-center justify-center">
        <span className="font-display font-black text-4xl text-brand-red/20">PV</span>
        {post.categories?.[0] && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px]
            font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full
            bg-brand-red/80 text-white">
            <Tag size={9} />
            {post.categories[0]}
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-brand-text-dim">
          <Calendar size={12} />
          {date}
        </div>
        <h2 className="font-display font-bold text-lg text-white leading-snug
          group-hover:text-brand-red transition-colors duration-200">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-brand-text-dim line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs font-display font-semibold text-brand-red mt-1">
          Read Article <ArrowUpRight size={13} />
        </div>
      </div>
    </Link>
  );
}
