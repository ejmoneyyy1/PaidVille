'use client';

import Link from 'next/link';
import Image from 'next/image';
import {motion} from 'framer-motion';
import type {BlogPost} from '@/components/sections/BlogPreview';
import {urlFor} from '@/lib/sanity';
import BlogCard from './BlogCard';

interface BlogIndexClientProps {
  posts: BlogPost[];
}

export default function BlogIndexClient({posts}: BlogIndexClientProps) {
  const [featuredPost, ...remainingPosts] = posts;

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.4}}>
      {featuredPost ? (
        <Link href={`/blog/${featuredPost.slug.current}`} className="group mb-10 block">
          <div className="relative aspect-video w-full overflow-hidden bg-silver">
            {featuredPost.mainImage?.asset?._ref ? (
              <Image
                src={urlFor(featuredPost.mainImage).width(1920).height(1080).fit('crop').quality(92).url()}
                alt={featuredPost.mainImage?.alt ?? featuredPost.title}
                width={1920}
                height={1080}
                className="h-full w-full object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-7xl font-black text-charcoal/20">
                PV
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 md:p-10">
              <h2 className="max-w-4xl text-3xl font-bold leading-tight text-white md:text-5xl">
                {featuredPost.title}
              </h2>
              <p className="mt-3 text-sm text-white/90">
                {featuredPost.author
                  ? `${featuredPost.author} · ${new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`
                  : new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </p>
            </div>
          </div>
        </Link>
      ) : null}

      {remainingPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {remainingPosts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{y: 30, opacity: 0}}
              whileInView={{y: 0, opacity: 1}}
              viewport={{once: true}}
              transition={{duration: 0.4, delay: index * 0.1}}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
