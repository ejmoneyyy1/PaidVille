import {cookies} from 'next/headers';
import {getPublishedPosts} from '@/lib/blog-storage';
import BlogIndexClient from './_components/BlogIndexClient';
import BlogPageHeader from './_components/BlogPageHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Biased Opinions',
  description: 'Editorial by PaidVille.',
};

export default async function BlogPage() {
  const posts = getPublishedPosts();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';

  return (
    <div className="min-h-screen bg-cream pb-24 pt-20">
      <BlogPageHeader heading="Biased Opinions" subheading="Editorial by PaidVille" />

      <div className="container-max section-padding pt-10">
        {posts.length === 0 && !isAdmin ? (
          <div className="py-24 text-center">
            <p className="text-2xl text-charcoal">No posts yet.</p>
            <p className="mt-3 text-base text-charcoal/60">Check back soon.</p>
          </div>
        ) : (
          <BlogIndexClient posts={posts} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}
