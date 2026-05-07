import {getSanityClient} from '@/lib/sanity-server';
import {blogQuery} from '@/lib/sanity';
import type {BlogPost} from '@/components/sections/BlogPreview';
import BlogIndexClient from './_components/BlogIndexClient';

export const revalidate = 60;

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    const client = await getSanityClient();
    const fetchedPosts = await client.fetch<BlogPost[]>(blogQuery);
    posts = fetchedPosts ?? [];
  } catch {
    // Unconfigured Sanity
  }

  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <header className="w-full border-b border-brand-red/40">
        <div className="container-max section-padding py-12 md:py-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.36em] text-brand-red">Editorial</p>
          <h1 className="mt-3 text-[40px] font-black leading-[0.95] text-charcoal md:text-[72px]">
            Biased Opinions
          </h1>
          <div className="mt-6 h-px w-full bg-brand-red" />
          <p className="mt-5 max-w-2xl text-base text-charcoal/60">
            Unfiltered takes on events, culture, and the creative industry
          </p>
        </div>
      </header>

      <div className="container-max section-padding pt-10">
        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-2xl text-charcoal">No posts yet.</p>
            <p className="mt-3 text-base text-charcoal/60">Zay is cooking something up — check back soon.</p>
          </div>
        ) : (
          <BlogIndexClient posts={posts} />
        )}
      </div>
    </div>
  );
}
