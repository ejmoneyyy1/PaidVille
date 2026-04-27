import { sanityClient, blogQuery } from '@/lib/sanity';
import type { BlogPost } from '@/components/sections/BlogPreview';
import BlogCard from './_components/BlogCard';

export const revalidate = 60;

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await sanityClient.fetch<BlogPost[]>(blogQuery);
  } catch {
    // Sanity not yet configured — show empty state
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0A0A0A]">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="section-label justify-center">Latest Stories</span>
          <h1 className="section-title text-gradient-white mt-2">
            The <span className="text-brand-red">Blog</span>
          </h1>
          <p className="section-subtitle mx-auto mt-4 text-center">
            News, recaps, culture, and everything PaidVille.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-brand-text-dim">
            <p className="font-display text-xl mb-3">No posts yet.</p>
            <p className="text-sm">
              Connect your{' '}
              <a
                href="https://sanity.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline"
              >
                Sanity CMS
              </a>{' '}
              to start publishing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
