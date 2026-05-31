'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {AnimatePresence, motion} from 'framer-motion';
import {Play, Plus, Edit, Trash2} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GalleryMediaLightbox from '@/components/gallery/GalleryMediaLightbox';
import GalleryVideoThumbnail from '@/components/gallery/GalleryVideoThumbnail';
import GalleryItemModal from '@/components/gallery/GalleryItemModal';
import type {GalleryItem} from '@/lib/gallery-storage';

function isVideoItem(item: GalleryItem): boolean {
  return item.mediaType === 'video' && !!item.videoPath;
}

function posterFor(item: GalleryItem): string | null {
  return item.imagePath ?? item.posterPath ?? null;
}

export default function GalleryPageMasonry({
  items,
  isAdmin,
}: {
  items: GalleryItem[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditing(item);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditing(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this gallery item? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/gallery-item?id=${id}`, {method: 'DELETE'});
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete gallery item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete gallery item');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      {isAdmin && (
        <div className="mb-8 flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
          >
            <Plus size={16} />
            Add to Gallery
          </button>
        </div>
      )}

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:_balance]">
        {items.map((item, index) => {
          const poster = posterFor(item);
          const isTall = index % 3 === 0;
          const video = isVideoItem(item);

          return (
            <ScrollReveal key={item.id} delay={index * 0.04} direction="up">
              <motion.div
                className="break-inside-avoid relative mb-5"
                whileHover={{scale: 1.005}}
                transition={{duration: 0.2}}
              >
                <div className="overflow-hidden rounded-2xl border border-brand-red bg-cream text-left shadow-sm transition-shadow hover:shadow-md">
                  <motion.div
                    role="button"
                    tabIndex={0}
                    className={`relative w-full cursor-pointer bg-gradient-to-br from-brand-muted/40 to-brand-card-surface ${
                      isTall ? 'aspect-[3/4]' : 'aspect-[5/4]'
                    }`}
                    onClick={() => setSelected(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(item);
                      }
                    }}
                  >
                    {poster ? (
                      <Image
                        src={poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : video && item.videoPath ? (
                      <GalleryVideoThumbnail src={item.videoPath} title={item.title} />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-muted/30 to-brand-card-surface">
                        <span className="font-display font-black text-4xl text-brand-red/12">PV</span>
                      </div>
                    )}
                    {video ? (
                      <span
                        className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-brand-red/90 text-white pointer-events-none"
                        aria-hidden
                      >
                        <Play size={8} fill="white" />
                        Video
                      </span>
                    ) : null}
                  </motion.div>
                  <div className="p-4 pt-3 space-y-2">
                    <h2 className="font-display font-bold text-lg text-charcoal leading-snug line-clamp-2 break-words">
                      {item.title}
                    </h2>
                    {isAdmin ? (
                      <div className="flex gap-2 border-t border-charcoal/10 pt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-charcoal px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-charcoal/80"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          disabled={deleting === item.id}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deleting === item.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          );
        })}
      </div>

      <AnimatePresence>
        {selected ? (
          <GalleryMediaLightbox key={selected.id} item={selected} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>

      {showModal && (
        <GalleryItemModal item={editing || undefined} onClose={handleClose} onSuccess={handleSuccess} />
      )}
    </>
  );
}
