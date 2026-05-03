import {defineEnableDraftMode} from 'next-sanity/draft-mode';
import {getSanityReadClient} from '@/lib/sanity-server';

export const runtime = 'nodejs';

export const {GET} = defineEnableDraftMode({
  client: getSanityReadClient(),
});
