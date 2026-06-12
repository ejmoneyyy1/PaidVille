import {getSanityPublicClient} from '@/lib/sanity-server';
import {blogQuery} from '@/lib/sanity';
import type {BlogPost} from '@/components/sections/BlogPreview';
import {getSingletonDocs} from '@/lib/get-singleton-docs';
import {stockPosts} from './_data/stock-content';

export const metadata = {
  title: 'Biased Opinions',
  description:
    'The PaidVille editorial — unfiltered takes on events, lifestyle, culture, and what it means to live elevated in Fayetteville, AR.',
  openGraph: {
    title: 'Biased Opinions | PaidVille',
    description: 'Unfiltered takes on events, culture, and elevated living from PaidVille.',
  },
};
import BlogIndexClient from './_components/BlogIndexClient';
import BlogPageHeader from './_components/BlogPageHeader';
import type {DisplayPost} from './_components/BlogCard';

export const revalidate = 60;

function sectionString(sections: unknown, key: string, prop: 'heading' | 'subheading'): string | null {
  if (!Array.isArray(sections)) return null;
  const block = sections.find((item: {_key?: string}) => item?._key === key) as Record<string, unknown> | undefined;
  const v = block?.[prop];
  return typeof v === 'string' ? v : null;
}

export default async function BlogPage() {
  let sanityPosts: BlogPost[] = [];
  try {
    const client = getSanityPublicClient();
    const fetchedPosts = await client.fetch<BlogPost[]>(blogQuery);
    sanityPosts = fetchedPosts ?? [];
  } catch {
    // Unconfigured Sanity
  }
  const displayPosts: DisplayPost[] = sanityPosts.length > 0 ? sanityPosts : stockPosts;
  const {homepage} = await getSingletonDocs();
  const sections = homepage?.sections;
  const blogHeading = sectionString(sections, 'blog-1', 'heading') ?? 'Biased Opinions';
  const blogSub =
    sectionString(sections, 'blog-1', 'subheading') ?? 'Editorial by PaidVille';

  return (
    <div className="min-h-screen bg-transparent pb-24 pt-20">
      <BlogPageHeader heading={blogHeading} subheading={blogSub} />

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
