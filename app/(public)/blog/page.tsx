import {getSanityClient} from '@/lib/sanity-server';
import {blogQuery} from '@/lib/sanity';
import type {BlogPost} from '@/components/sections/BlogPreview';
import {stockPosts} from './_data/stock-content';
import BlogIndexClient from './_components/BlogIndexClient';

export const revalidate = 60;

export default async function BlogPage() {
  let sanityPosts: BlogPost[] = [];
  try {
    const client = await getSanityClient();
    const fetchedPosts = await client.fetch<BlogPost[]>(blogQuery);
    sanityPosts = fetchedPosts ?? [];
  } catch {
    // Unconfigured Sanity
  }
  const displayPosts = sanityPosts.length > 0 ? sanityPosts : stockPosts;

  return (
    <div className="min-h-screen bg-cream pb-24 pt-20">
      <header className="w-full">
        <div className="container-max section-padding pb-10 pt-[60px]">
          <p className="text-right text-[10px] uppercase tracking-[0.44em] text-brand-red">
            EST. 2018 · FAYETTEVILLE, AR
          </p>
          <h1 className="mt-4 text-[clamp(72px,12vw,140px)] font-black uppercase leading-[0.9] text-charcoal">
            <span className="block">Biased</span>
            <span className="block">Opinions</span>
          </h1>
          <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-brand-red">Editorial by PaidVille</p>
        </div>
        <div className="h-px w-full bg-brand-red" />
      </header>

      <div className="container-max section-padding pt-10">
        {displayPosts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-2xl text-charcoal">No posts yet.</p>
            <p className="mt-3 text-base text-charcoal/60">Zay is cooking something up — check back soon.</p>
          </div>
        ) : (
          <BlogIndexClient posts={displayPosts} />
        )}
      </div>
    </div>
  );
}
