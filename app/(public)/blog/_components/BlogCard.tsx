import Link from 'next/link';
import {Calendar, ArrowUpRight, Play} from 'lucide-react';
import type {BlogPost} from '@/components/sections/BlogPreview';

function buildImageUrl(post: BlogPost) {
  const ref = post.mainImage?.asset?._ref;
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const ds = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
  if (!ref || !pid) return null;
  return `https://cdn.sanity.io/images/${pid}/${ds}/${ref.replace('image-', '').replace(/-(\w+)$/, '.$1')}`;
}

export default function BlogCard({post}: {post: BlogPost}) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const imgUrl = buildImageUrl(post);

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-silver overflow-hidden">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt={post.mainImage?.alt ?? post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-silver">
            <span className="font-display font-black text-4xl text-brand-red/15">PV</span>
          </div>
        )}
        {post.heroVideoUrl ? (
          <span
            className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-brand-red/90 px-2 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-white pointer-events-none"
            aria-hidden
          >
            <Play size={8} fill="white" />
            Video
          </span>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-cream/90 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-charcoal/55">
          <Calendar size={12} />
          {date}
          {post.author && (
            <>
              <span className="text-charcoal/25">·</span>
              <span>{post.author}</span>
            </>
          )}
        </div>
        <h2 className="font-display font-bold text-lg text-charcoal leading-snug group-hover:text-brand-red transition-colors duration-200">
          {post.title}
        </h2>
        <div className="flex items-center gap-1 text-xs font-display font-semibold text-brand-red mt-1">
          Read article <ArrowUpRight size={13} />
        </div>
      </div>
    </Link>
  );
}
