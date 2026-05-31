import Link from 'next/link';
import {notFound} from 'next/navigation';
import {cookies} from 'next/headers';
import {getPostBySlug, getPublishedPosts} from '@/lib/blog-storage';
import ArticleHeroMedia from '@/components/blog/ArticleHeroMedia';
import BlogCard from '../_components/BlogCard';
import {HeroMotion, ShareBar} from './_components/ArticleMotion';
import ArticleEditButton from './_components/ArticleEditButton';

/** New posts must not briefly resolve as stale 404 in the CDN/app cache. */
export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{slug: string}>;
}

function formatVolume(value: number) {
  return `VOL. ${String(value).padStart(2, '0')}`;
}

const noiseTexture =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")";

export default async function BlogPostPage({params}: Params) {
  const {slug} = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const isAdmin = (await cookies()).get('pv_admin')?.value === 'true';

  const published = getPublishedPosts();
  const position = published.findIndex((item) => item.slug === slug);
  const volumeLabel = formatVolume(position >= 0 ? position + 1 : 1);
  const relatedPosts = published.filter((item) => item.slug !== slug).slice(0, 3);

  const category = post.category || 'EDITORIAL';
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="min-h-screen bg-cream pb-24 pt-20">
      <section className="relative w-full min-h-[500px]">
        {isAdmin ? <ArticleEditButton post={post} /> : null}
        <Link
          href="/blog"
          className="absolute left-5 top-5 z-20 text-[10px] uppercase tracking-[0.34em] text-white transition-opacity hover:opacity-60"
        >
          ← Biased Opinions
        </Link>
        <ArticleHeroMedia
          title={post.title}
          posterUrl={post.coverImage ?? null}
          heroVideoUrl={post.heroVideoUrl ?? null}
          alt={post.title}
          fallbackBg="#1A1A1A"
          noiseTexture={noiseTexture}
        />

        <div className="absolute bottom-0 left-0 z-10 p-6 md:p-12">
          <HeroMotion>
            <p className="mb-2 text-[10px] uppercase tracking-[0.34em] text-white/50">{volumeLabel}</p>
            <p className="mb-3 text-[10px] uppercase tracking-[0.34em] text-brand-red">{category}</p>
            <h1 className="max-w-[680px] text-[clamp(32px,5vw,56px)] font-black leading-[1.0] text-white">
              {post.title}
            </h1>
            <p className="mt-4 text-[13px] text-white/70">
              {post.author ? `By ${post.author} · ${date}` : date}
            </p>
          </HeroMotion>
        </div>
      </section>

      <div className="border-y border-charcoal/20 py-4">
        <div className="container-max section-padding flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-[13px] font-bold text-charcoal">By {post.author || 'PaidVille'}</p>
          <p className="text-[13px] text-charcoal/55">
            {date} · {category}
          </p>
          <p className="font-mono text-[12px] text-charcoal/40 sm:ml-auto">/{post.slug}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[700px] px-6 py-16 text-[18px] leading-[1.85] text-charcoal">
        {post.body.map((paragraph, index) => (
          <p
            key={`${paragraph.slice(0, 20)}-${index}`}
            className={
              index === 0
                ? 'mb-7 first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:text-7xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-brand-red'
                : 'mb-7'
            }
          >
            {paragraph}
          </p>
        ))}

        <ShareBar slug={slug} />
      </div>

      {relatedPosts.length > 0 ? (
        <section className="container-max section-padding mt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.36em] text-brand-red">
            More from Biased Opinions
          </p>
          <div className="mt-3 h-px w-full bg-brand-red" />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedPosts.map((relatedPost, index) => (
              <BlogCard key={relatedPost.id} post={relatedPost} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
