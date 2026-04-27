import { notFound } from 'next/navigation';
import { sanityClient } from '@/lib/sanity';
import type { BlogPost } from '@/components/sections/BlogPreview';

export const runtime = 'edge';
export const revalidate = 60;

interface Params {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await sanityClient.fetch<BlogPost>(
      `*[_type == "post" && slug.current == $slug][0] {
        _id, title, slug, mainImage, publishedAt, excerpt,
        "author": author->name, "categories": categories[]->title,
        body
      }`,
      { slug }
    );
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="min-h-screen pt-32 pb-24 bg-[#0A0A0A]">
      <div className="container-max section-padding max-w-3xl">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex gap-2 mb-6">
            {post.categories.map((cat) => (
              <span
                key={cat}
                className="text-xs px-3 py-1 rounded-full bg-brand-red/10 text-brand-red
                  border border-brand-red/20 font-display font-semibold tracking-wider uppercase"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-display font-black text-4xl md:text-5xl text-white leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-brand-text-dim mb-10 pb-10
          border-b border-white/8">
          <time dateTime={post.publishedAt}>{date}</time>
          {post.author && (
            <>
              <span className="text-white/20">·</span>
              <span>{post.author}</span>
            </>
          )}
        </div>

        {post.excerpt && (
          <p className="text-xl text-white/70 leading-relaxed mb-8 font-light">
            {post.excerpt}
          </p>
        )}

        {/* Rich body from Sanity — wire up @portabletext/react when ready */}
        <div className="prose prose-invert prose-lg max-w-none text-brand-text-dim">
          <p className="text-brand-text-dim/60 italic text-sm">
            [Article body — configure @portabletext/react to render Sanity block content]
          </p>
        </div>
      </div>
    </article>
  );
}
