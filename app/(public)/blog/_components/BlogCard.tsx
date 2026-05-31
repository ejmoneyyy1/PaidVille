import Link from 'next/link';
import Image from 'next/image';
import type {BlogPost} from '@/lib/blog-storage';

const noiseTexture =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")";

export default function BlogCard({
  post,
  index,
  className = '',
}: {
  post: BlogPost;
  index: number;
  className?: string;
}) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const hasImage = Boolean(post.coverImage);
  const category = post.category || 'EDITORIAL';
  const cardNumber = `${index + 2}`.padStart(2, '0');
  const isDarkFallback = !hasImage;
  const excerptText =
    post.excerpt ||
    'No filter, no fluff — the stories shaping PaidVille and the culture around it.';

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative block h-full border p-6 ${
        isDarkFallback ? 'border-[#333333] text-white' : 'border-silver bg-cream text-charcoal'
      } ${className}`}
      style={
        isDarkFallback
          ? {
              backgroundColor: '#1A1A1A',
              backgroundImage: noiseTexture,
            }
          : undefined
      }
    >
      {hasImage && post.coverImage ? (
        <div className="relative -mx-6 -mt-6 mb-6 aspect-[3/2] overflow-hidden bg-silver">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1200}
            height={800}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : null}

      <span className="pointer-events-none absolute right-4 top-2 text-7xl font-black leading-none text-current opacity-[0.06]">
        {cardNumber}
      </span>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.34em] text-brand-red">
        {category}
      </p>
      <h3
        className={`text-[22px] font-extrabold leading-[1.15] transition-colors ${
          isDarkFallback ? 'text-white group-hover:text-brand-red' : 'text-charcoal group-hover:text-brand-red'
        }`}
      >
        {post.title}
      </h3>
      <p className={`mt-3 line-clamp-2 text-sm ${isDarkFallback ? 'text-white/75' : 'text-charcoal/75'}`}>
        {excerptText}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <span className={`text-[13px] ${isDarkFallback ? 'text-white/70' : 'text-charcoal/55'}`}>
          {post.author ? `By ${post.author} · ${date}` : date}
        </span>
        <p className="text-[11px] uppercase tracking-[0.24em] text-brand-red">Read More →</p>
      </div>
    </Link>
  );
}
