import Image from 'next/image';
import {notFound} from 'next/navigation';
import {draftMode} from 'next/headers';
import {getSanityClient} from '@/lib/sanity-server';
import BlogBody from '@/components/portable/BlogBody';
import {urlFor} from '@/lib/sanity';

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
    <article className="min-h-screen pt-32 pb-24 bg-cream">
      <div className="container-max section-padding max-w-3xl">
        <h1 className="font-display font-black text-4xl md:text-5xl text-charcoal leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-charcoal/55 mb-10 pb-10 border-b border-brand-red">
          <time dateTime={post.publishedAt}>{date}</time>
          {post.author && (
            <>
              <span className="text-charcoal/25">·</span>
              <span>{post.author}</span>
            </>
          )}
        </div>

        {post.heroVideoUrl ? (
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl border border-brand-red bg-black">
            <video
              src={post.heroVideoUrl}
              controls
              playsInline
              className="h-full w-full object-contain"
              poster={posterUrl ?? undefined}
            />
          </div>
        ) : posterUrl ? (
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl border border-brand-red">
            <Image
              src={posterUrl}
              alt={post.mainImage?.alt ?? post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        ) : null}

        <div className="text-base">
          <BlogBody value={post.body} />
        </div>
      </div>
    </article>
  );
}
