'use client';

import {useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {motion} from 'framer-motion';
import {Edit, Trash2, Plus} from 'lucide-react';
import BlogCard from './BlogCard';
import BlogModal from '@/components/blog/BlogModal';
import type {BlogPost} from '@/lib/blog-storage';

const noiseTexture =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")";

function AdminControls({
  post,
  isAdmin,
  onEdit,
  onDelete,
  deleting,
}: {
  post: BlogPost;
  isAdmin: boolean;
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
  deleting: string | null;
}) {
  if (!isAdmin) return null;
  return (
    <div className="absolute right-4 top-4 z-20 flex gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(post);
        }}
        className="flex items-center gap-1 rounded-lg bg-charcoal/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-charcoal"
      >
        <Edit size={13} />
        Edit
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(post);
        }}
        disabled={deleting === post.id}
        className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
      >
        <Trash2 size={13} />
        {deleting === post.id ? '…' : 'Delete'}
      </button>
    </div>
  );
}

export default function BlogIndexClient({
  posts,
  isAdmin,
}: {
  posts: BlogPost[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingPost(null);
    setShowModal(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditingPost(null);
    router.refresh();
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(post.id);
    try {
      const res = await fetch(`/api/admin/blog?id=${encodeURIComponent(post.id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const [featuredPost, ...remainingPosts] = posts;
  const featuredDate = featuredPost
    ? new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.4}}>
      {isAdmin ? (
        <div className="mb-8 flex justify-end">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
          >
            <Plus size={16} />
            Add Post
          </button>
        </div>
      ) : null}

      {featuredPost ? (
        <div className="relative mb-10">
          <AdminControls
            post={featuredPost}
            isAdmin={isAdmin}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            deleting={deleting}
          />
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <div
              className="relative min-h-[70vh] w-full overflow-hidden bg-silver"
              style={
                !featuredPost.coverImage
                  ? {
                      backgroundColor: '#1A1A1A',
                      backgroundImage: noiseTexture,
                    }
                  : undefined
              }
            >
              {featuredPost.coverImage ? (
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
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
                  {featuredPost.category || 'EDITORIAL'}
                </p>
                <h2 className="max-w-[800px] text-[clamp(36px,5vw,64px)] font-black leading-[1.0] text-white">
                  {featuredPost.title}
                </h2>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {remainingPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="relative"
              initial={{y: 40, opacity: 0}}
              whileInView={{y: 0, opacity: 1}}
              viewport={{once: true}}
              transition={{duration: 0.45, delay: index * 0.08}}
            >
              <AdminControls
                post={post}
                isAdmin={isAdmin}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                deleting={deleting}
              />
              <BlogCard post={post} index={index} className="h-full" />
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

      {showModal && (
        <BlogModal
          post={editingPost || undefined}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </motion.div>
  );
}
