import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {draftMode} from 'next/headers';
import {getSanityClient} from '@/lib/sanity-server';
import BlogBody from '@/components/portable/BlogBody';
import {urlFor} from '@/lib/sanity';
import type {BlogPost} from '@/components/sections/BlogPreview';
import BlogCard from '../_components/BlogCard';

export const revalidate = 60;

interface Params {
  params: Promise<{slug: string}>;
}

type BlogDoc = {
  _id: string;
  title: string;
  slug: {current: string};
  mainImage?: {asset: {_ref: string}; alt?: string};
  heroVideoUrl?: string | null;
  publishedAt: string;
  author?: string;
  body?: unknown;
};

async function getPost(slug: string): Promise<BlogDoc | null> {
  try {
    const {isEnabled} = await draftMode();
    const client = await getSanityClient();
    const filter = isEnabled
      ? `_type == "blog" && slug.current == $slug`
      : `_type == "blog" && slug.current == $slug && status == "published"`;
    return await client.fetch<BlogDoc>(
      `*[${filter}][0] {
        _id, title, slug, mainImage, heroVideoUrl, publishedAt, author, body
      }`,
      {slug}
    );
  } catch {
    return null;
  }
}

export default async function BlogPostPage({params}: Params) {
  const {slug} = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  let morePosts: BlogPost[] = [];

  try {
    const client = await getSanityClient();
    morePosts = await client.fetch<BlogPost[]>(
      `*[_type == "blog" && status == "published" && slug.current != $slug] | order(publishedAt desc)[0...3] {
        _id,
        title,
        slug,
        mainImage,
        heroVideoUrl,
        publishedAt,
        author
      }`,
      {slug}
    );
  } catch {
    morePosts = [];
  }

  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let posterUrl: string | null = null;
  if (post.mainImage?.asset?._ref) {
    try {
      posterUrl = urlFor(post.mainImage).width(1600).quality(88).url();
    } catch {
      posterUrl = null;
    }
  }

  return (
    <article className="min-h-screen bg-cream pt-24 pb-24">
      <section className="relative w-full">
        <Link
          href="/blog"
          className="absolute left-5 top-5 z-20 text-[13px] uppercase tracking-[0.2em] text-brand-red transition-opacity hover:opacity-70"
        >
          ← Biased Opinions
        </Link>
        <div className="relative mx-auto w-full max-h-[600px] overflow-hidden">
          <div className="relative aspect-[16/9] max-h-[600px] w-full bg-silver">
            {post.heroVideoUrl ? (
              <video
                src={post.heroVideoUrl}
                controls
                playsInline
                className="h-full w-full object-cover"
                poster={posterUrl ?? undefined}
              />
            ) : posterUrl ? (
              <Image
                src={posterUrl}
                alt={post.mainImage?.alt ?? post.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-8xl font-black text-charcoal/20">
                PV
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

            <div className="absolute bottom-0 left-0 z-10 p-6 md:p-12">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-brand-red">Editorial</p>
              <h1 className="max-w-[700px] text-[clamp(32px,5vw,56px)] font-bold leading-[0.95] text-white">
                {post.title}
              </h1>
              <p className="mt-4 text-sm text-white/85">
                {post.author ? `${post.author} · ${date}` : date}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-0 border-y border-silver py-4">
        <p className="text-center text-sm text-charcoal/80">
          <span className="font-bold text-charcoal">By {post.author || 'PaidVille'}</span> · Published {date}
        </p>
      </div>

      <div className="mx-auto max-w-[700px] px-6 py-12 text-[18px] leading-[1.85] text-charcoal">
        <BlogBody value={post.body} />
      </div>

      {morePosts.length > 0 ? (
        <section className="container-max section-padding mt-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.36em] text-brand-red">
            More from Biased Opinions
          </p>
          <div className="mt-3 h-px w-full bg-brand-red" />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {morePosts.map((relatedPost) => (
              <BlogCard key={relatedPost._id} post={relatedPost} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
