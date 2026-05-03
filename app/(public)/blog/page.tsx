import {getSanityClient} from '@/lib/sanity-server';
import {blogQuery, galleryBlogMediaQuery, type SanityGalleryDoc} from '@/lib/sanity';
import type {BlogPost} from '@/components/sections/BlogPreview';
import BlogCard from './_components/BlogCard';
import BlogGalleryMediaStrip from './_components/BlogGalleryMediaStrip';

export const revalidate = 60;

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let blogGalleryMedia: SanityGalleryDoc[] = [];
  try {
    const client = await getSanityClient();
    const [fetchedPosts, fetchedMedia] = await Promise.all([
      client.fetch<BlogPost[]>(blogQuery),
      client.fetch<SanityGalleryDoc[]>(galleryBlogMediaQuery),
    ]);
    posts = fetchedPosts ?? [];
    blogGalleryMedia = fetchedMedia ?? [];
  } catch {
    // Unconfigured Sanity
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-cream">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <span className="section-label justify-center">Editorial</span>
          <h1 className="section-title text-charcoal mt-2">
            Biased <span className="text-brand-red">Opinions</span>
          </h1>
          <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/65">
            Notes from the PaidVille desk — published from Sanity.
          </p>
        </div>

        <BlogGalleryMediaStrip items={blogGalleryMedia} />

        {posts.length === 0 ? (
          <div className="text-center py-20 text-charcoal/50">
            <p className="font-display text-xl mb-3">No posts yet.</p>
            <p className="text-sm">Publish a post in Studio to see it here.</p>
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
