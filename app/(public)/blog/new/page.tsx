import {redirect} from 'next/navigation';
import {getSanityStudioUrl} from '@/lib/studio-url';

export default function BlogNewPage() {
  redirect(`${getSanityStudioUrl()}/structure/blog`);
}
