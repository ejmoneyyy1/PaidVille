'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Tag } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
    alt?: string;
  };
  publishedAt: string;
  excerpt?: string;
  author?: string;
  categories?: string[];
}

interface BlogPreviewProps {
  posts: BlogPost[];
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <Link
        href={`/blog/${post.slug.current}`}
        className="group block h-full rounded-2xl overflow-hidden card-glass card-glass-hover"
      >
        {/* Image */}
        <div className="relative aspect-video bg-brand-card-surface overflow-hidden">
          {post.mainImage ? (
            <Image
              src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${post.mainImage.asset._ref
                .replace('image-', '')
                .replace(/-(\w+)$/, '.$1')}`}
              alt={post.mainImage.alt ?? post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-muted to-brand-card-surface
              flex items-center justify-center">
              <span className="font-display font-black text-4xl text-brand-red/20">PV</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category badge */}
          {post.categories?.[0] && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px]
              font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full
              bg-brand-red/80 text-white backdrop-blur-sm">
              <Tag size={9} />
              {post.categories[0]}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-brand-text-dim">
            <Calendar size={12} />
            {date}
            {post.author && (
              <>
                <span className="text-white/20">·</span>
                <span>{post.author}</span>
              </>
            )}
          </div>

          <h3 className="font-display font-bold text-lg text-white leading-snug
            group-hover:text-brand-red transition-colors duration-200">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-sm text-brand-text-dim leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-1 text-xs font-display font-semibold
            text-brand-red mt-1 group-hover:gap-2 transition-all duration-200">
            Read Article
            <ArrowUpRight size={13} />
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
}

export default function BlogPreview({ posts }: BlogPreviewProps) {
  return (
    <section id="blog" className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden">
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(176,0,0,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        {/* Header */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label">Latest News</span>
            <h2 className="section-title text-gradient-white">
              From the <span className="text-brand-red">Blog</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold
              text-brand-red hover:text-brand-red-light transition-colors group self-start sm:self-auto"
          >
            View All Posts
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </ScrollReveal>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-brand-text-dim font-display">
            Blog posts coming soon — connect your Sanity CMS to get started.
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
