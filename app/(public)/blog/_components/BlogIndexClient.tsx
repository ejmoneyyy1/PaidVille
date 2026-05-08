'use client';

import Link from 'next/link';
import Image from 'next/image';
import {motion} from 'framer-motion';
import {urlFor} from '@/lib/sanity';
import BlogCard, {type DisplayPost} from './BlogCard';
import EditableField from '@/components/admin/EditableField';
import AdminDeleteControl from '@/components/admin/AdminDeleteControl';
import {isSanityBlogPost} from '@/lib/blog-admin';

interface BlogIndexClientProps {
  posts: DisplayPost[];
}

const noiseTexture =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")";

export default function BlogIndexClient({posts}: BlogIndexClientProps) {
  const [featuredPost, ...remainingPosts] = posts;
  const featuredHasImage = Boolean(featuredPost?.mainImage?.asset?._ref);
  const featuredDate = featuredPost
    ? new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const featuredEditable = featuredPost ? isSanityBlogPost(featuredPost) : false;

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.4}}>
      {featuredPost ? (
        <div className="relative mb-10">
          {featuredEditable ? (
            <AdminDeleteControl
              documentId={featuredPost._id}
              entityLabel="this post"
              className="absolute right-6 top-6 z-[30] flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white shadow-md backdrop-blur-sm hover:bg-brand-red"
            />
          ) : null}
          <Link href={`/blog/${featuredPost.slug.current}`} className="group block">
          <div
            className="relative min-h-[70vh] w-full overflow-hidden bg-silver"
            style={
              !featuredHasImage
                ? {
                    backgroundColor: featuredPost.fallbackBg ?? '#1A1A1A',
                    backgroundImage: noiseTexture,
                  }
                : undefined
            }
          >
            {featuredHasImage && featuredPost.mainImage ? (
              <Image
                src={urlFor(featuredPost.mainImage).width(1920).height(1080).fit('crop').quality(92).url()}
                alt={featuredPost.mainImage.alt ?? featuredPost.title}
                width={1920}
                height={1080}
                className="h-full w-full object-cover"
                sizes="100vw"
                priority
              />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 md:p-12">
              <p className="mb-3 text-[10px] uppercase tracking-[0.34em] text-brand-red">
                {featuredPost.category ?? 'EDITORIAL'}
              </p>
              {featuredEditable ? (
                <EditableField
                  documentId={featuredPost._id}
                  field="title"
                  label="Post title (featured)"
                  value={featuredPost.title}
                  type="textarea"
                  wrapperClassName="group/edit relative block max-w-[800px]"
                >
                  <h2 className="text-[clamp(36px,5vw,64px)] font-black leading-[1.0] text-white">
                    {featuredPost.title}
                  </h2>
                </EditableField>
              ) : (
                <h2 className="max-w-[800px] text-[clamp(36px,5vw,64px)] font-black leading-[1.0] text-white">
                  {featuredPost.title}
                </h2>
              )}
              <p className="mt-3 text-[13px] text-white/70">
                {featuredPost.author ? `By ${featuredPost.author} · ${featuredDate}` : featuredDate}
              </p>
            </div>
            <span className="pointer-events-none absolute bottom-0 right-8 text-[200px] font-black leading-none text-white opacity-[0.06]">
              01
            </span>
          </div>
        </Link>
        </div>
      ) : null}

      {remainingPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
          <motion.div
            initial={{y: 40, opacity: 0}}
            whileInView={{y: 0, opacity: 1}}
            viewport={{once: true}}
            transition={{duration: 0.5, delay: 0}}
          >
            {remainingPosts[0] ? (
              <BlogCard post={remainingPosts[0]} index={0} className="h-full lg:min-h-[640px]" />
            ) : null}
          </motion.div>
          <div className="grid grid-cols-1 gap-6">
            {remainingPosts.slice(1, 3).map((post, index) => (
              <motion.div
                key={post._id}
                initial={{y: 40, opacity: 0}}
                whileInView={{y: 0, opacity: 1}}
                viewport={{once: true}}
                transition={{duration: 0.5, delay: (index + 1) * 0.08}}
              >
                <BlogCard post={post} index={index + 1} />
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}

      {remainingPosts.length > 3 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {remainingPosts.slice(3).map((post, index) => (
            <motion.div
              key={post._id}
              initial={{y: 40, opacity: 0}}
              whileInView={{y: 0, opacity: 1}}
              viewport={{once: true}}
              transition={{duration: 0.45, delay: index * 0.08}}
            >
              <BlogCard post={post} index={index + 3} />
            </motion.div>
          ))}
        </div>
      ) : null}

      <div className="mt-12 border-y border-brand-red py-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-center">
          <p className="text-lg font-bold text-charcoal">SUBSCRIBE TO BIASED OPINIONS</p>
          <p className="text-right text-sm text-charcoal/60">
            New drops every two weeks — no spam, just culture.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
