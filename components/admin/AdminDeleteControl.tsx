'use client';

import {useState} from 'react';
import {useAdmin} from '@/contexts/AdminContext';
import {Trash2} from 'lucide-react';

export default function AdminDeleteControl({
  documentId,
  entityLabel,
  className,
  onDeleted,
  redirectAfterDelete,
}: {
  documentId: string;
  entityLabel?: string;
  /** e.g. "absolute left-3 top-3 z-[20]" — parent should be relative */
  className?: string;
  onDeleted?: () => void;
  redirectAfterDelete?: string;
}) {
  const {isAdmin, deleteDocument} = useAdmin();
  const [busy, setBusy] = useState(false);

  /** Logged-in site admin sees delete anytime (pencils still require Editing On). */
  if (!isAdmin || !documentId) return null;

  const label = entityLabel ?? 'this item';

  return (
    <button
      type="button"
      disabled={busy}
      title={`Remove ${label}`}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Delete ${label}? This removes it from the site.`)) return;
        setBusy(true);
        try {
          await deleteDocument(documentId, redirectAfterDelete);
          onDeleted?.();
        } catch {
          alert('Could not delete. Try again.');
        } finally {
          setBusy(false);
        }
      }}
      className={
        className ??
        'absolute right-3 top-3 z-[20] flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-charcoal text-white shadow-md transition-opacity hover:bg-brand-red hover:border-brand-red disabled:opacity-60'
      }
      aria-label={`Delete ${label}`}
    >
      <Trash2 size={15} strokeWidth={2} />
    </button>
  );
}
