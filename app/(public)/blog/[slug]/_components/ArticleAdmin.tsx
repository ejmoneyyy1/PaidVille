'use client';

import EditableField from '@/components/admin/EditableField';
import BlogBody from '@/components/portable/BlogBody';
import {portableTextToPlain} from '@/lib/portable-text-admin';

export function EditablePostTitle({
  documentId,
  title,
  children,
}: {
  documentId: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <EditableField
      documentId={documentId}
      field="title"
      label="Post title"
      value={title}
      type="textarea"
      wrapperClassName="group/edit relative block max-w-[680px]"
    >
      {children}
    </EditableField>
  );
}

export function EditablePostCategory({
  documentId,
  category,
  children,
}: {
  documentId: string;
  category: string;
  children: React.ReactNode;
}) {
  return (
    <EditableField
      documentId={documentId}
      field="category"
      label="Category label"
      value={category}
      type="text"
      wrapperClassName="group/edit relative inline-block"
    >
      {children}
    </EditableField>
  );
}

export function EditablePostAuthor({
  documentId,
  author,
  children,
}: {
  documentId: string;
  author: string;
  children: React.ReactNode;
}) {
  return (
    <EditableField
      documentId={documentId}
      field="author"
      label="Author name"
      value={author}
      type="text"
      wrapperClassName="group/edit relative inline-block"
    >
      {children}
    </EditableField>
  );
}

export function EditablePostBody({
  documentId,
  body,
}: {
  documentId: string;
  body: unknown;
}) {
  return (
    <EditableField
      documentId={documentId}
      field="body"
      label="Article body (paragraphs = blank line between)"
      value={portableTextToPlain(body)}
      type="richtext"
      wrapperClassName="group/edit relative block"
    >
      <BlogBody value={body} />
    </EditableField>
  );
}
