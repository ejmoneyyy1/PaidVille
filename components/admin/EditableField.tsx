'use client';

import {useAdmin} from '@/contexts/AdminContext';

interface EditableFieldProps {
  documentId: string;
  field: string;
  label: string;
  value: unknown;
  type?: 'text' | 'textarea' | 'number' | 'image' | 'richtext';
  children: React.ReactNode;
  /** Use block wrapper for full-width / stacked content */
  wrapperClassName?: string;
}

export default function EditableField({
  documentId,
  field,
  label,
  value,
  type = 'text',
  children,
  wrapperClassName = 'relative inline-block group',
}: EditableFieldProps) {
  const {isAdmin, isEditing, openPanel} = useAdmin();

  if (!isAdmin || !isEditing || !documentId) {
    return <>{children}</>;
  }

  const isEmpty = value === null || value === undefined || value === '';

  return (
    <span className={wrapperClassName}>
      {isEmpty ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openPanel({documentId, field, label, value, type});
          }}
          className="inline-flex items-center gap-1.5 rounded border border-dashed border-brand-red/50 px-2 py-1 text-xs text-brand-red/70 hover:border-brand-red hover:text-brand-red transition-colors"
          title={`Add ${label}`}
          aria-label={`Add ${label}`}
        >
          ✏️ Add {label}
        </button>
      ) : (
        <>
          {children}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openPanel({documentId, field, label, value, type});
            }}
            className="absolute -right-2 -top-2 z-[1000] flex h-6 w-6 items-center justify-center rounded-full border-0 bg-brand-red text-xs opacity-0 shadow-md transition-opacity duration-150 group-hover/edit:opacity-100"
            title={`Edit ${label}`}
            aria-label={`Edit ${label}`}
          >
            ✏️
          </button>
        </>
      )}
    </span>
  );
}
