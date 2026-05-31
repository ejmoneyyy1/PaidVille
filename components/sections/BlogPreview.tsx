'use client';

import Link from 'next/link';
import {ArrowUpRight, Calendar, Play} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {splitHeadingLastWord} from '@/lib/heading-display';
import type {BlogPost} from '@/lib/blog-storage';

export type {BlogPost} from '@/lib/blog-storage';

const DEFAULT_BLOG_HEADING = 'Biased Opinions';

interface BlogPreviewProps {
  posts: BlogPost[];
  isAdmin: boolean;
  heading?: string | null;
}

function BlogCard({post, index}: {post: BlogPost; index: number}) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <Link
        href={`/blog/${post.slug}`}
        className="group block h-full rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="relative aspect-video bg-silver overflow-hidden">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
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

export default function BlogPreview({posts, isAdmin, heading}: BlogPreviewProps) {
  const blogTitle = heading ?? DEFAULT_BLOG_HEADING;
  const {lead, accent} = splitHeadingLastWord(blogTitle, DEFAULT_BLOG_HEADING);

  return (
    <section id="blog" className="relative py-24 md:py-32 bg-cream overflow-hidden border-t border-brand-red">
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(176,0,0,0.05) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        <ScrollReveal className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="section-label">Editorial</span>
            <h2 className="section-title text-charcoal">
              {lead ? (
                <>
                  {lead} <span className="text-brand-red">{accent}</span>
                </>
              ) : (
                <span className="text-brand-red">{accent}</span>
              )}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 self-start sm:items-end sm:self-auto">
            {isAdmin && (
              <Link
                href="/blog?admin=true"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark transition-colors"
              >
                Manage Posts
                <ArrowUpRight size={15} />
              </Link>
            )}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-display font-semibold text-brand-red hover:text-brand-red-dark transition-colors group"
            >
              View all posts
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </ScrollReveal>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-charcoal/50 font-display">
            {isAdmin ? (
              <Link href="/blog?admin=true" className="text-brand-red hover:underline">
                Add your first post
              </Link>
            ) : (
              'New posts will appear here soon.'
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
