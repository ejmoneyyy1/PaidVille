'use client';

import {useRouter} from 'next/navigation';
import {useAdmin} from '@/contexts/AdminContext';
import {getSanityStudioUrl} from '@/lib/studio-url';

export default function AdminToolbar() {
  const {isAdmin, isEditing, toggleEditing} = useAdmin();
  const router = useRouter();
  const studio = getSanityStudioUrl();

  if (!isAdmin) return null;

  const exitAdmin = async () => {
    await fetch('/api/admin/logout', {method: 'POST'});
    router.refresh();
    window.location.href = '/';
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-0 rounded-full px-6 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      style={{backgroundColor: '#1A1A1A'}}
    >
      <span className="font-display text-sm font-black text-brand-red">PV</span>
      <span className="mx-3 h-6 w-px bg-[#2A2A2A]" aria-hidden />

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

      <span className="mx-3 h-6 w-px bg-[#2A2A2A]" aria-hidden />

      <div className="flex items-center gap-2">
        <a
          href="/blog/new"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 hover:text-brand-red"
        >
          + Post
        </a>
        <a
          href={`${studio}/structure/event`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 hover:text-brand-red"
        >
          + Event
        </a>
        <a
          href={`${studio}/structure/gallery`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 hover:text-brand-red"
        >
          + Photo
        </a>
      </div>

      <span className="mx-3 h-6 w-px bg-[#2A2A2A]" aria-hidden />

      <button
        type="button"
        onClick={exitAdmin}
        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-red hover:opacity-80"
      >
        Exit Admin
      </button>
    </div>
  );
}
