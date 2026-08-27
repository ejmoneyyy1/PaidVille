'use client';

import EditableField from '@/components/admin/EditableField';
import {splitHeadingLastWord} from '@/lib/heading-display';

/**
 * A page hero header (label + heading + subheading) that admins can edit
 * inline. Stores plain strings on the siteContent singleton; the heading's
 * last word renders in brand red automatically, so the client just types
 * words — no markup. Falls back to the given defaults when unset, and when
 * documentId is empty (no siteContent doc) it renders as plain, uneditable
 * text so the page never breaks.
 */
export default function EditablePageHeader({
  documentId,
  label,
  titleField,
  subtitleField,
  title,
  subtitle,
  fallbackTitle,
  fallbackSubtitle,
}: {
  documentId: string;
  label: string;
  titleField: string;
  subtitleField: string;
  title?: string | null;
  subtitle?: string | null;
  fallbackTitle: string;
  fallbackSubtitle: string;
}) {
  const titleText = (title ?? '').trim() || fallbackTitle;
  const subtitleText = (subtitle ?? '').trim() || fallbackSubtitle;
  const {lead, accent} = splitHeadingLastWord(titleText, fallbackTitle);

  return (
    <div className="container-max section-padding mb-4 text-center">
      <span className="section-label justify-center">{label}</span>
      <EditableField
        documentId={documentId}
        field={titleField}
        label="Page heading (last word shows in red)"
        value={titleText}
        type="text"
        wrapperClassName="group/edit relative mx-auto inline-block"
      >
        <h1 className="section-title text-charcoal mt-2">
          {lead ? (
            <>
              {lead} <span className="text-brand-red">{accent}</span>
            </>
          ) : (
            <span className="text-brand-red">{accent}</span>
          )}
        </h1>
      </EditableField>
      <EditableField
        documentId={documentId}
        field={subtitleField}
        label="Page subheading"
        value={subtitleText}
        type="textarea"
        wrapperClassName="group/edit relative mx-auto mt-4 block max-w-3xl"
      >
        <p className="section-subtitle mx-auto text-center text-charcoal/65">{subtitleText}</p>
      </EditableField>
    </div>
  );
}
