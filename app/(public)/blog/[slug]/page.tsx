import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {draftMode} from 'next/headers';
import {getSanityClient} from '@/lib/sanity-server';
import {urlFor} from '@/lib/sanity';
import type {BlogPost} from '@/components/sections/BlogPreview';
import BlogCard from '../_components/BlogCard';
import {stockArticles, stockPosts} from '../_data/stock-content';
import {HeroMotion, PullQuoteMotion, ShareBar} from './_components/ArticleMotion';
import {
  EditablePostAuthor,
  EditablePostBody,
  EditablePostCategory,
  EditablePostTitle,
} from './_components/ArticleAdmin';
import EditableField from '@/components/admin/EditableField';
import ArticleAdminBar from './_components/ArticleAdminBar';

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
  category?: string | null;
  excerpt?: string | null;
};

const stockVolumeMap: Record<string, number> = {
  'welcome-to-biased-opinions': 1,
  'what-makes-an-unforgettable-event': 2,
  'your-brand-is-priceless': 3,
  'fayetteville-creative-scene': 4,
};

function formatVolume(value: number) {
  return `VOL. ${String(value).padStart(2, '0')}`;
}

async function getPost(slug: string): Promise<BlogDoc | null> {
  try {
    const {isEnabled} = await draftMode();
    const client = await getSanityClient();
    const filter = isEnabled
      ? `_type == "blog" && slug.current == $slug`
      : `_type == "blog" && slug.current == $slug && status == "published"`;
    return await client.fetch<BlogDoc>(
      `*[${filter}][0] {
        _id, title, slug, mainImage, heroVideoUrl, publishedAt, author, body, category, excerpt
      }`,
      {slug}
    );
  } catch {
    return null;
  }
}

export default async function BlogPostPage({params}: Params) {
  const {slug} = await params;
  const sanityPost = await getPost(slug);
  const stockArticle = stockArticles[slug];
  if (!sanityPost && !stockArticle) notFound();
  let morePosts: BlogPost[] = [];
  let volumeLabel = formatVolume(stockVolumeMap[slug] ?? 1);

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
        author,
        excerpt,
        category
      }`,
      {slug}
    );
  } catch {
    morePosts = [];
  }

  const post = sanityPost ?? {
    _id: `stock-${slug}`,
    title: stockArticle!.title,
    slug: {current: slug},
    publishedAt: stockArticle!.publishedAt,
    author: stockArticle!.author,
  };
  const cmsId = sanityPost?._id ?? '';
  const category = sanityPost?.category ?? stockArticle?.category ?? 'EDITORIAL';
  const heroBg = stockArticle?.headerBg ?? '#1A1A1A';
  const isStock = !sanityPost;

  if (sanityPost) {
    try {
      const client = await getSanityClient();
      const slugsByDate = await client.fetch<Array<{slug: {current: string}}>>(
        `*[_type == "blog" && status == "published"] | order(publishedAt desc) {
          slug
        }`
      );
      const position = slugsByDate.findIndex((item) => item.slug?.current === slug);
      volumeLabel = formatVolume(position >= 0 ? position + 1 : 1);
    } catch {
      volumeLabel = formatVolume(1);
    }
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
  const showNoiseHero = !posterUrl;
  const relatedPosts =
    morePosts.length > 0 ? morePosts : stockPosts.filter((item) => item.slug.current !== slug).slice(0, 3);
  const pullQuote = isStock ? stockArticle?.body?.[2] : null;

  return (
    <article className="min-h-screen bg-cream pb-24 pt-20">
      <section className="relative w-full min-h-[500px]">
        {sanityPost ? <ArticleAdminBar documentId={sanityPost._id} /> : null}
        <Link
          href="/blog"
          className="absolute left-5 top-5 z-20 text-[10px] uppercase tracking-[0.34em] text-white transition-opacity hover:opacity-60"
        >
          ← Biased Opinions
        </Link>
        <div
          className="relative min-h-[500px] w-full overflow-hidden"
          style={
            showNoiseHero
              ? {
                  backgroundColor: heroBg,
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
                }
              : undefined
          }
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={post.mainImage?.alt ?? post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 z-10 p-6 md:p-12">
            <HeroMotion>
              <p className="mb-2 text-[10px] uppercase tracking-[0.34em] text-white/50">{volumeLabel}</p>
              <p className="mb-3 text-[10px] uppercase tracking-[0.34em] text-brand-red">{category}</p>
              <EditablePostTitle documentId={cmsId} title={post.title}>
                <h1 className="max-w-[680px] text-[clamp(32px,5vw,56px)] font-black leading-[1.0] text-white">
                  {post.title}
                </h1>
              </EditablePostTitle>
              <p className="mt-4 text-[13px] text-white/70">
                {post.author ? `By ${post.author} · ${date}` : date}
              </p>
            </HeroMotion>
          </div>
        </div>
      </section>

      <div className="border-y border-charcoal/20 py-4">
        <div className="container-max section-padding flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <EditablePostAuthor documentId={cmsId} author={post.author ?? ''}>
            <p className="text-[13px] font-bold text-charcoal">By {post.author || 'PaidVille'}</p>
          </EditablePostAuthor>
          <EditablePostCategory documentId={cmsId} category={category}>
            <p className="text-[13px] text-charcoal/55">
              {date} · {category}
            </p>
          </EditablePostCategory>
          {cmsId ? (
            <EditableField
              documentId={cmsId}
              field="slug"
              label="URL slug (use lowercase letters, numbers, hyphens)"
              value={slug}
              type="text"
              wrapperClassName="group/edit relative sm:ml-auto"
            >
              <p className="font-mono text-[12px] text-charcoal/40">/{slug}</p>
            </EditableField>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[700px] px-6 py-16 text-[18px] leading-[1.85] text-charcoal">
        {isStock ? (
          <>
            {stockArticle?.body.map((paragraph, index) => (
              <div key={`${paragraph.slice(0, 20)}-${index}`}>
                <p
                  className={
                    index === 0
                      ? 'mb-7 first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:text-7xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-brand-red'
                      : 'mb-7'
                  }
                >
                  {paragraph}
                </p>
                {index === 2 && pullQuote ? (
                  <PullQuoteMotion>
                    <div className="my-12 bg-charcoal px-8 py-12 text-center">
                      <div className="mx-auto mb-6 h-[2px] w-24 bg-brand-red" />
                      <p className="text-[28px] italic leading-tight text-white">"{pullQuote}"</p>
                      <div className="mx-auto mt-6 h-[2px] w-24 bg-brand-red" />
                    </div>
                  </PullQuoteMotion>
                ) : null}
              </div>
            ))}
          </>
        ) : sanityPost ? (
          <EditablePostBody documentId={cmsId} body={sanityPost.body} />
        ) : null}

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
              <BlogCard key={relatedPost._id} post={relatedPost} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
