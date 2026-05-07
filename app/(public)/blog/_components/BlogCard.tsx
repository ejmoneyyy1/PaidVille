import Link from 'next/link';
import Image from 'next/image';
import type {BlogPost} from '@/components/sections/BlogPreview';
import {urlFor} from '@/lib/sanity';

export default function BlogCard({post, category = 'Editorial'}: {post: BlogPost; category?: string}) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const image = post.mainImage?.asset?._ref
    ? {
        src: urlFor(post.mainImage).width(1200).height(800).fit('crop').quality(90).url(),
        width: 1200,
        height: 800,
      }
    : null;

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block border border-silver bg-cream"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-silver">
        {image ? (
          <Image
            src={image.src}
            alt={post.mainImage?.alt ?? post.title}
            width={image.width}
            height={image.height}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-silver">
            <span className="text-5xl font-black text-charcoal/20">PV</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-brand-red">{category}</p>
        <h2 className="mb-3 text-[20px] font-bold leading-tight text-charcoal decoration-brand-red underline-offset-4 transition-all hover:underline">
          {post.title}
        </h2>
        <p className="text-[13px] text-charcoal/60">
          {post.author ? `${post.author} · ${date}` : date}
        </p>
      </div>
    </Link>
  );
}
