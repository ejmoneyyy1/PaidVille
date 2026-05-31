'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {Calendar, MapPin, Edit, Trash2, Plus, X, ChevronLeft, ChevronRight} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import EventModal from '@/components/events/EventModal';
import type {Event} from '@/lib/event-storage';

export default function EventsPageClient({
  events,
  isAdmin,
}: {
  events: Event[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getEventImages = (event: Event): string[] => {
    const imgs: string[] = [];
    if (event.imagePath) imgs.push(event.imagePath);
    (event.galleryImages ?? []).forEach((p) => {
      if (p && !imgs.includes(p)) imgs.push(p);
    });
    return imgs;
  };

  const openViewer = (event: Event) => {
    setViewingEvent(event);
    setCurrentImageIndex(0);
  };

  const closeViewer = () => setViewingEvent(null);

  const viewerImages = viewingEvent ? getEventImages(viewingEvent) : [];
  const prevImage = () =>
    setCurrentImageIndex((i) => (i - 1 + viewerImages.length) % viewerImages.length);
  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % viewerImages.length);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleOpenEdit = (event: Event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditingEvent(null);
    router.refresh();
  };

  const handleDelete = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Delete this event? This cannot be undone.')) return;

    setDeleting(eventId);
    try {
      const res = await fetch(`/api/admin/event?id=${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen pt-32 pb-0 bg-cream">
      <div className="container-max section-padding mb-12 text-center relative">
        <span className="section-label justify-center">What's Coming Up</span>
        <h1 className="section-title text-charcoal mt-2">
          All <span className="text-brand-red">Events</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/65">
          Reserve your spot — exclusive PaidVille experiences.
        </p>

        {/* Admin Add Event Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="absolute top-0 right-0 flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors"
          >
            <Plus size={16} />
            Add Event
          </button>
        )}
      </div>

      <div className="container-max section-padding pb-24">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-charcoal/55 font-display">
              No upcoming events yet — check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <ScrollReveal key={event.id} delay={index * 0.06} direction="up">
                <motion.div
                  whileHover={{y: -3}}
                  className="rounded-2xl overflow-hidden border border-brand-red bg-white shadow-sm flex flex-col h-full"
                >
                  {event.imagePath && (
                    <button
                      type="button"
                      onClick={() => openViewer(event)}
                      className="relative aspect-video bg-silver block w-full group/img cursor-zoom-in"
                    >
                      <Image
                        src={event.imagePath}
                        alt={event.eventName}
                        fill
                        className="object-cover transition-transform group-hover/img:scale-105"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                      {getEventImages(event).length > 1 && (
                        <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {getEventImages(event).length} photos
                        </span>
                      )}
                    </button>
                  )}

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h2 className="font-display font-bold text-lg text-charcoal">
                      {event.eventName}
                    </h2>

                    <div className="flex flex-col gap-2 text-sm text-charcoal/65">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-brand-red" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-brand-red" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-charcoal/65 flex-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Admin Controls or RSVP Button */}
                    {isAdmin ? (
                      <div className="flex gap-2 pt-2 border-t border-charcoal/10">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(event)}
                          className="flex-1 flex items-center justify-center gap-1 bg-charcoal text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-charcoal/80 transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(event.id, e)}
                          disabled={deleting === event.id}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deleting === event.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ) : (
                      <a
                        href={event.eventbriteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full justify-center py-3 text-xs mt-auto"
                      >
                        RSVP / Get Tickets
                      </a>
                    )}
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <EventModal
          event={editingEvent || undefined}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}

      {/* Image viewer lightbox */}
      <AnimatePresence>
        {viewingEvent && viewerImages.length > 0 && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-4 pt-4 ${
              isAdmin ? 'pb-28' : 'pb-4'
            }`}
            onClick={closeViewer}
          >
            <button
              type="button"
              onClick={closeViewer}
              className="absolute top-4 right-4 z-10 text-white transition-colors hover:text-brand-red"
            >
              <X size={32} />
            </button>

            <div className="mb-4 max-w-xl px-4 text-center" onClick={(e) => e.stopPropagation()}>
              <p className="font-display text-lg font-bold text-white">{viewingEvent.eventName}</p>
              <p className="text-sm text-white/70">
                {formatDate(viewingEvent.date)} · {viewingEvent.location}
              </p>
            </div>

            <div className="flex w-full max-w-3xl items-start justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              {viewerImages.length > 1 && (
                <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
                  {viewerImages.map((img, i) => (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(i);
                      }}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-[72px] sm:w-[72px] ${
                        i === currentImageIndex
                          ? 'border-brand-red ring-2 ring-brand-red'
                          : 'border-white/30 opacity-70 hover:border-white hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="72px" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <div className="relative h-[60vh] w-[60vh] max-w-[80vw]">
                  <Image
                    src={viewerImages[currentImageIndex]}
                    alt={`${viewingEvent.eventName} - View ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 80vw, 60vh"
                  />
                </div>

                {viewerImages.length > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="rounded-full bg-white/90 p-3 text-charcoal shadow-lg transition-all hover:bg-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="min-w-[80px] rounded-full bg-black/80 px-6 py-2 text-center text-sm font-semibold text-white backdrop-blur-sm">
                      {currentImageIndex + 1} / {viewerImages.length}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="rounded-full bg-white/90 p-3 text-charcoal shadow-lg transition-all hover:bg-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
