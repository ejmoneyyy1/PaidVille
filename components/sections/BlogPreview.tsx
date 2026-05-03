'use client';

import Link from 'next/link';
import {ArrowUpRight, Calendar, Play} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export interface BlogPost {
  _id: string;
  title: string;
  slug: {current: string};
  mainImage?: {
    asset: {_ref: string};
    alt?: string;
  };
  /** Optional hero video — same idea as Gallery `videoUrl` (direct file URL). */
  heroVideoUrl?: string | null;
  publishedAt: string;
  author?: string;
}

interface BlogPreviewProps {
  posts: BlogPost[];
}

function BlogCard({post, index}: {post: BlogPost; index: number}) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const imgUrl =
    post.mainImage?.asset?._ref && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
      ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}/${post.mainImage.asset._ref.replace('image-', '').replace(/-(\w+)$/, '.$1')}`
      : null;

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <Link
        href={`/blog/${post.slug.current}`}
        className="group block h-full rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm hover:shadow-md transition-shadow"
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

          <h3 className="font-display font-bold text-lg text-charcoal leading-snug group-hover:text-brand-red transition-colors duration-200">
            {post.title}
          </h3>

          <div className="flex items-center gap-1 text-xs font-display font-semibold text-brand-red mt-1 group-hover:gap-2 transition-all duration-200">
            Read article
            <ArrowUpRight size={13} />
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
}

export default function BlogPreview({posts}: BlogPreviewProps) {
  return (
    <section id="blog" className="relative py-24 md:py-32 bg-cream overflow-hidden border-t border-brand-red">
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(176,0,0,0.05) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label">Editorial</span>
            <h2 className="section-title text-charcoal">
              Biased <span className="text-brand-red">Opinions</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold text-brand-red hover:text-brand-red-dark transition-colors group self-start sm:self-auto"
          >
            View all posts
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </ScrollReveal>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-charcoal/50 font-display">
            Published posts from Sanity will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post, i) => (
              <BlogCard key={post._id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
