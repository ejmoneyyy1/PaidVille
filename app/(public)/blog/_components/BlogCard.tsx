import Link from 'next/link';
import Image from 'next/image';
import type {BlogPost} from '@/components/sections/BlogPreview';
import {blogHasImage, blogImageUrl} from '@/lib/resolve-blog-image';
import type {StockPost} from '../_data/stock-content';
import EditableField from '@/components/admin/EditableField';
import AdminDeleteControl from '@/components/admin/AdminDeleteControl';
import BlogPostMediaUpload from '@/components/blog/BlogPostMediaUpload';
import {isSanityBlogPost} from '@/lib/blog-admin';

export type DisplayPost = BlogPost & Partial<Pick<StockPost, 'fallbackBg' | 'fallbackAccent'>>;

const noiseTexture =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")";

export default function BlogCard({
  post,
  index,
  className = '',
}: {
  post: DisplayPost;
  index: number;
  className?: string;
}) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const hasImage = blogHasImage(post.mainImage);
  const imageSrc = blogImageUrl(post.mainImage, 1200, 800);
  const image = imageSrc ? {src: imageSrc, width: 1200, height: 800} : null;
  const category = post.category ?? 'EDITORIAL';
  const accent = post.fallbackAccent ?? '#B00000';
  const cardNumber = `${index + 2}`.padStart(2, '0');
  const isDarkFallback = !hasImage;
  const canEdit = isSanityBlogPost(post);
  const excerptText =
    post.excerpt ?? 'No filter, no fluff — the stories shaping PaidVille and the culture around it.';

  return (
    <div className={`relative ${className}`}>
      {canEdit ? (
        <>
          <AdminDeleteControl
            documentId={post._id}
            entityLabel="this post"
            className="absolute right-5 top-5 z-[20] flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-charcoal/90 text-white shadow-md hover:bg-brand-red"
          />
          <BlogPostMediaUpload
            documentId={post._id}
            slug={post.slug.current}
            hasCover={hasImage}
            hasVideo={Boolean(post.heroVideoUrl)}
            variant="card"
          />
        </>
      ) : null}
      <Link
        href={`/blog/${post.slug.current}`}
        className={`group relative block h-full border p-6 ${
          isDarkFallback ? 'border-[#333333] text-white' : 'border-silver bg-cream text-charcoal'
        }`}
        style={
          isDarkFallback
            ? {
                backgroundColor: post.fallbackBg ?? '#1A1A1A',
                backgroundImage: noiseTexture,
              }
            : undefined
        }
      >
      {hasImage && image ? (
        <div className="relative -mx-6 -mt-6 mb-6 aspect-[3/2] overflow-hidden bg-silver">
          <Image
            src={image.src}
            alt={post.mainImage?.alt ?? post.title}
            width={image.width}
            height={image.height}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : null}

      <span className="pointer-events-none absolute right-4 top-2 text-7xl font-black leading-none text-current opacity-[0.06]">
        {cardNumber}
      </span>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.34em]" style={{color: accent}}>
        {category}
      </p>
      {canEdit ? (
        <EditableField
          documentId={post._id}
          field="title"
          label="Post title"
          value={post.title}
          type="textarea"
          wrapperClassName="group/edit relative block"
        >
          <h3
            className={`text-[22px] font-extrabold leading-[1.15] transition-colors ${isDarkFallback ? 'text-white group-hover:text-brand-red' : 'text-charcoal group-hover:text-brand-red'}`}
          >
            {post.title}
          </h3>
        </EditableField>
      ) : (
        <h3
          className={`text-[22px] font-extrabold leading-[1.15] transition-colors ${isDarkFallback ? 'text-white group-hover:text-brand-red' : 'text-charcoal group-hover:text-brand-red'}`}
        >
          {post.title}
        </h3>
      )}
      {canEdit ? (
        <EditableField
          documentId={post._id}
          field="excerpt"
          label="Post excerpt"
          value={excerptText}
          type="textarea"
          wrapperClassName="group/edit relative mt-3 block"
        >
          <p className={`line-clamp-2 text-sm ${isDarkFallback ? 'text-white/75' : 'text-charcoal/75'}`}>
            {excerptText}
          </p>
        </EditableField>
      ) : (
        <p className={`mt-3 line-clamp-2 text-sm ${isDarkFallback ? 'text-white/75' : 'text-charcoal/75'}`}>
          {excerptText}
        </p>
      )}
        <div className="mt-5 flex items-center justify-between">
          <span className={`text-[13px] ${isDarkFallback ? 'text-white/70' : 'text-charcoal/55'}`}>
            {post.author ? `By ${post.author} · ${date}` : date}
          </span>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{color: accent}}>
            Read More →
          </p>
        </div>
      </Link>
    </div>
  );
}
