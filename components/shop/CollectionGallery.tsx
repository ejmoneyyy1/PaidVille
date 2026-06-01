'use client';

import {useState} from 'react';
import Image from 'next/image';
import {AnimatePresence, motion} from 'framer-motion';
import {X, ChevronLeft, ChevronRight, Trash2, Upload, Edit} from 'lucide-react';
import {useRouter} from 'next/navigation';
import type {CollectionImage} from '@/lib/collection-storage';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function CollectionGallery({
  images,
  isAdmin,
}: {
  images: CollectionImage[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<CollectionImage | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (images.length === 0 && !isAdmin) return null;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Remove this image from the collection?')) return;

    setDeleting(imageId);
    try {
      const res = await fetch(`/api/admin/collection?id=${imageId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenEditModal = (image: CollectionImage) => {
    setEditingImage(image);
    setShowModal(true);
  };

  const handleOpenAddModal = () => {
    setEditingImage(null);
    setShowModal(true);
  };

  return (
    <section className="py-16 bg-silver">
      <div className="container-max section-padding">
        <div className="text-center mb-8 relative">
          <span className="section-label justify-center">Collection Gallery</span>
          <h2 className="section-title text-charcoal mt-2">
            Explore the <span className="text-brand-red">collection</span>
          </h2>

          {/* Admin Add Image Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="absolute top-0 right-0 flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors"
            >
              <Upload size={16} />
              Add Image
            </button>
          )}
        </div>

        {/* Masonry Grid matching regular gallery */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:_balance]">
          {images.map((img, index) => {
            const isTall = index % 3 === 0;

            return (
              <ScrollReveal key={img.id} delay={index * 0.04} direction="up">
                <motion.div
                  className="break-inside-avoid relative mb-5"
                  whileHover={{scale: 1.005}}
                  transition={{duration: 0.2}}
                >
                  <div className="overflow-hidden rounded-2xl border border-brand-red bg-cream text-left shadow-sm transition-shadow hover:shadow-md">
                    <motion.div
                      role="button"
                      tabIndex={0}
                      className={`group relative w-full cursor-pointer overflow-hidden bg-gradient-to-br from-brand-muted/40 to-brand-card-surface ${
                        isTall ? 'aspect-[3/4]' : 'aspect-[5/4]'
                      }`}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-admin-control="true"]')) return;
                        openLightbox(index);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openLightbox(index);
                        }
                      }}
                    >
                      <Image
                        src={img.imagePath}
                        alt={img.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </motion.div>

                    <div className="p-4 pt-3 space-y-2">
                      <h2 className="font-display font-bold text-lg text-charcoal leading-snug line-clamp-2 break-words">
                        {img.title}
                      </h2>

                      {img.description && (
                        <p className="text-sm text-charcoal/60 line-clamp-2">{img.description}</p>
                      )}

                      {isAdmin && (
                        <div
                          className="flex flex-wrap items-center justify-between gap-2 border-t border-charcoal/10 pt-3"
                          data-admin-control="true"
                        >
                          <button
                            type="button"
                            onClick={() => handleDelete(img.id)}
                            disabled={deleting === img.id}
                            className="text-xs font-display font-bold uppercase tracking-wide text-red-600 underline-offset-2 hover:text-red-800 hover:underline disabled:opacity-50 flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            {deleting === img.id ? 'Deleting...' : 'Delete'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(img)}
                            className="text-xs font-display font-bold uppercase tracking-wide text-charcoal/50 underline-offset-2 hover:text-charcoal hover:underline flex items-center gap-1"
                          >
                            <Edit size={12} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="text-xs font-display font-bold uppercase tracking-wide text-charcoal/50 underline-offset-2 hover:text-charcoal hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openLightbox(index);
                            }}
                          >
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images.length > 0 && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-brand-red transition-colors z-10"
            >
              <X size={32} />
            </button>

            {/* Image Info */}
            <div className="absolute top-6 left-6 bg-black/80 text-white px-5 py-3 rounded-lg z-10 max-w-md backdrop-blur-sm">
              <p className="font-display font-bold text-lg">{images[selectedIndex].title}</p>
              {images[selectedIndex].description && (
                <p className="text-sm text-white/90 mt-1">{images[selectedIndex].description}</p>
              )}
            </div>

            <div className="relative w-full max-w-5xl aspect-square mb-20">
              <Image
                src={images[selectedIndex].imagePath}
                alt={images[selectedIndex].title}
                fill
                className="object-contain"
                sizes="90vw"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Bottom Controls */}
            {images.length > 1 && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="bg-white/90 hover:bg-white text-charcoal p-3 rounded-full transition-all shadow-lg"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="bg-black/80 text-white px-6 py-2 rounded-full text-sm font-semibold min-w-[80px] text-center backdrop-blur-sm">
                  {selectedIndex + 1} / {images.length}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="bg-white/90 hover:bg-white text-charcoal p-3 rounded-full transition-all shadow-lg"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      {showModal && (
        <CollectionImageModal
          image={editingImage}
          onClose={() => {
            setShowModal(false);
            setEditingImage(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingImage(null);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

function CollectionImageModal({
  image,
  onClose,
  onSuccess,
}: {
  image: CollectionImage | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (image?.id) {
        formData.append('imageId', image.id);
      }

      const res = await fetch('/api/admin/collection', {
        method: image?.id ? 'PATCH' : 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Failed to save image');
        return;
      }

      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-[#1A1A1A] border border-[#333]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#333] px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {image ? 'Edit Collection Image' : 'Add Collection Image'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold uppercase text-white/70 mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={image?.title ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Collection Title"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold uppercase text-white/70 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={image?.description ?? ''}
              rows={3}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Brief description or caption"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-xs font-semibold uppercase text-white/70 mb-1"
            >
              Image {!image && '*'}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              required={!image}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white file:uppercase hover:file:bg-[#900000] focus:border-brand-red focus:outline-none"
            />
            {image?.imagePath && (
              <p className="mt-1 text-xs text-white/50">Leave empty to keep current image</p>
            )}
          </div>

          {error && (
            <div className="rounded border border-red-900 bg-red-900/20 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded border border-[#555] px-4 py-2 text-sm font-semibold uppercase text-white/80 hover:border-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-brand-red px-4 py-2 text-sm font-semibold uppercase text-white hover:bg-[#900000] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : image ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
