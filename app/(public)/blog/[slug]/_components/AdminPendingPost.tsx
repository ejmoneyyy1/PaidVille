'use client';

import {notFound} from 'next/navigation';
import {useAdmin} from '@/contexts/AdminContext';
import PendingBlogPost from './PendingBlogPost';

export default function AdminPendingPost({slug}: {slug: string}) {
  const {isAdmin} = useAdmin();
  if (isAdmin) return <PendingBlogPost slug={slug} />;
  notFound();
}
