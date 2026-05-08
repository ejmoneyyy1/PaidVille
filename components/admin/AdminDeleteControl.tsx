'use client';

import {useState} from 'react';
import {useAdmin} from '@/contexts/AdminContext';
import {Trash2} from 'lucide-react';
import {cn} from '@/lib/utils';

const iconButtonClass =
  'absolute right-3 top-3 z-[20] flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-charcoal text-white shadow-md transition-opacity hover:bg-brand-red hover:border-brand-red disabled:opacity-60';

const textLinkClass =
  'inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wide text-brand-red hover:underline disabled:opacity-60';

export default function AdminDeleteControl({
  documentId,
  entityLabel,
  className,
  onDeleted,
  redirectAfterDelete,
  /** `text` = inline row (footer bar); default = floating icon button */
  appearance = 'icon',
}: {
  documentId: string;
  entityLabel?: string;
  /** Merged with default for `icon` or `text` appearance */
  className?: string;
  onDeleted?: () => void;
  redirectAfterDelete?: string;
  appearance?: 'icon' | 'text';
}) {
  const {isAdmin, deleteDocument} = useAdmin();
  const [busy, setBusy] = useState(false);

  /** Logged-in site admin sees delete anytime (pencils still require Editing On). */
  if (!isAdmin || !documentId) return null;

  const label = entityLabel ?? 'this item';

  const mergedClass = cn(appearance === 'text' ? textLinkClass : iconButtonClass, className);

  return (
    <button
      type="button"
      data-admin-delete="true"
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
      className={mergedClass}
      aria-label={`Delete ${label}`}
    >
      {appearance === 'text' ? (
        <>
          <Trash2 size={14} strokeWidth={2} />
          Delete
        </>
      ) : (
        <Trash2 size={15} strokeWidth={2} />
      )}
    </button>
  );
}
