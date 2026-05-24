'use client';

import {useRouter} from 'next/navigation';
import {useAdmin} from '@/contexts/AdminContext';

export default function AdminToolbar() {
  const {isAdmin, isEditing, toggleEditing} = useAdmin();
  const router = useRouter();

  if (!isAdmin) return null;

  const exitAdmin = async () => {
    await fetch('/api/admin/logout', {method: 'POST'});
    router.refresh();
    window.location.href = '/';
  };

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2"
      style={{maxWidth: 'calc(100vw - 24px)'}}
    >
      <div
        className="pointer-events-auto flex flex-wrap items-center justify-center gap-y-2 rounded-full px-5 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)] sm:px-6"
        style={{backgroundColor: '#1A1A1A'}}
      >
        <span className="font-display text-sm font-black text-brand-red">PV</span>
        <span className="mx-2 h-6 w-px bg-[#2A2A2A] sm:mx-3" aria-hidden />

        <button
          type="button"
          onClick={toggleEditing}
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{backgroundColor: isEditing ? '#22c55e' : '#9ca3af'}}
          />
          {isEditing ? 'Editing On' : 'Editing Off'}
        </button>

        <span className="mx-2 h-6 w-px bg-[#2A2A2A] sm:mx-3" aria-hidden />

        <button
          type="button"
          onClick={() => router.push('/admin/dashboard')}
          className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-brand-red"
        >
          Dashboard
        </button>

        <span className="mx-2 h-6 w-px bg-[#2A2A2A] sm:mx-3" aria-hidden />

        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:gap-2">
          <button
            type="button"
            onClick={() => router.push('/blog/new?admin=true')}
            className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-brand-red"
          >
            + Post
          </button>
          <button
            type="button"
            onClick={() => router.push('/events/new?admin=true')}
            className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-brand-red"
          >
            + Event
          </button>
          <button
            type="button"
            onClick={() => router.push('/gallery/new?admin=true')}
            className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-brand-red"
          >
            + Photo
          </button>
        </div>

        <span className="mx-2 h-6 w-px bg-[#2A2A2A] sm:mx-3" aria-hidden />

        <button
          type="button"
          onClick={exitAdmin}
          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-red hover:opacity-80"
        >
          Exit Admin
        </button>
      </div>
    </div>
  );
}
