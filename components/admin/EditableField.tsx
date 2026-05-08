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

  return (
    <span className={wrapperClassName}>
      {children}
      <button
        type="button"
        onClick={() => openPanel({documentId, field, label, value, type})}
        className="absolute -right-2 -top-2 z-[1000] flex h-6 w-6 items-center justify-center rounded-full border-0 bg-brand-red text-xs opacity-0 shadow-md transition-opacity duration-150 group-hover/edit:opacity-100"
        title={`Edit ${label}`}
        aria-label={`Edit ${label}`}
      >
        ✏️
      </button>
    </span>
  );
}
