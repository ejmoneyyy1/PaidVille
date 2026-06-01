'use client';

import {useRef} from 'react';
import Link from 'next/link';
import {motion, useInView, useReducedMotion} from 'framer-motion';
import {ArrowUpRight, Calendar, Play} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {splitHeadingLastWord} from '@/lib/heading-display';
import {cn} from '@/lib/utils';
import type {BlogPost} from '@/lib/blog-storage';

export type {BlogPost} from '@/lib/blog-storage';

const DEFAULT_BLOG_HEADING = 'Biased Opinions';

const PLACEHOLDER_COLORS = ['#1A1A1A', '#B00000', '#2A1A1A'];

/**
 * Splits text into words and animates each one sliding up through an
 * `overflow-hidden` mask when the heading scrolls into view.
 */
function WordRevealTitle({text, className}: {text: string; className?: string}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, {once: true, margin: '-100px'});
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');

  if (prefersReduced) {
    return <h3 ref={ref} className={className}>{text}</h3>;
  }

  return (
    <h3 ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            aria-hidden
            className="inline-block"
            initial={{y: '115%'}}
            animate={inView ? {y: 0} : {y: '115%'}}
            transition={{delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </h3>
  );
}

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
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cream/90 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <div
              className="absolute inset-0 overflow-hidden transition-transform duration-500 group-hover:scale-[1.03]"
              style={{backgroundColor: PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]}}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display text-[7.5rem] font-black leading-none tracking-tighter text-white/[0.08]"
              >
                PV
              </span>
              <span
                className={cn(
                  'absolute left-4 top-4 font-display text-[10px] font-bold uppercase tracking-[0.28em]',
                  index % PLACEHOLDER_COLORS.length === 1 ? 'text-cream' : 'text-brand-red',
                )}
              >
                {post.category || 'Editorial'}
              </span>
              <span className="absolute bottom-4 left-4 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
                PaidVille
              </span>
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

          <WordRevealTitle
            text={post.title}
            className="font-display font-bold text-lg text-charcoal leading-snug group-hover:text-brand-red transition-colors duration-200"
          />

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
            <h2 className="section-title text-charcoal tracking-[-0.03em]">
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
