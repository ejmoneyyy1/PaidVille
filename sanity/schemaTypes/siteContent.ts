import {defineField, defineType} from 'sanity';

export const siteContentType = defineType({
  name: 'siteContent',
  title: 'Site Content',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero & Videos'},
    {name: 'services', title: 'Services'},
    {name: 'social', title: 'Social & Footer'},
    {name: 'pageHeaders', title: 'Page Headers'},
  ],
  fields: [
    // ── Videos ───────────────────────────────────────────────────────────────
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero Background Video URL',
      type: 'url',
      group: 'hero',
      description: 'MP4 URL shown as the hero section background (leave blank to use the default).',
    }),
    defineField({
      name: 'splashVideoUrl',
      title: 'Splash / Intro Video URL',
      type: 'url',
      group: 'hero',
      description: 'MP4 URL played during the intro loading sequence (leave blank to use the default).',
    }),
    // ── Hero text ─────────────────────────────────────────────────────────────
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Hero Subtext',
      type: 'string',
      group: 'hero',
    }),
    // ── Services ─────────────────────────────────────────────────────────────
    defineField({name: 'eventsTitle', title: 'Events Title', type: 'string', group: 'services'}),
    defineField({name: 'eventsDescription', title: 'Events Description', type: 'text', group: 'services'}),
    defineField({name: 'brandingTitle', title: 'Branding Title', type: 'string', group: 'services'}),
    defineField({name: 'brandingDescription', title: 'Branding Description', type: 'text', group: 'services'}),
    defineField({name: 'clothingTitle', title: 'Clothing Title', type: 'string', group: 'services'}),
    defineField({name: 'clothingDescription', title: 'Clothing Description', type: 'text', group: 'services'}),
    defineField({name: 'communityTitle', title: 'Community Title', type: 'string', group: 'services'}),
    defineField({name: 'communityDescription', title: 'Community Description', type: 'text', group: 'services'}),
    // ── Footer / Social ───────────────────────────────────────────────────────
    defineField({name: 'aboutText', title: 'About Text', type: 'text', group: 'social'}),
    defineField({name: 'footerTagline', title: 'Footer Tagline', type: 'string', group: 'social'}),
    defineField({name: 'instagramUrl', title: 'Instagram URL', type: 'url', group: 'social'}),
    defineField({name: 'tiktokUrl', title: 'TikTok URL', type: 'url', group: 'social'}),
    defineField({name: 'twitterUrl', title: 'Twitter / X URL', type: 'url', group: 'social'}),
    defineField({name: 'youtubeUrl', title: 'YouTube URL', type: 'url', group: 'social'}),
    defineField({name: 'facebookUrl', title: 'Facebook URL', type: 'url', group: 'social'}),
    // ── Page headers (editable on-page) ──────────────────────────────────────
    // The last word of each *Title renders in the brand red automatically.
    defineField({name: 'eventsPageTitle', title: 'Events Page — Heading', type: 'string', group: 'pageHeaders'}),
    defineField({name: 'eventsPageSubtitle', title: 'Events Page — Subheading', type: 'text', group: 'pageHeaders'}),
    defineField({name: 'shopPageTitle', title: 'Shop Page — Heading', type: 'string', group: 'pageHeaders'}),
    defineField({name: 'shopPageSubtitle', title: 'Shop Page — Subheading', type: 'text', group: 'pageHeaders'}),
    defineField({name: 'galleryPageTitle', title: 'Gallery Page — Heading', type: 'string', group: 'pageHeaders'}),
    defineField({name: 'galleryPageSubtitle', title: 'Gallery Page — Subheading', type: 'text', group: 'pageHeaders'}),
    defineField({name: 'collectionTitle', title: 'Collection Gallery — Heading', type: 'string', group: 'pageHeaders'}),
    defineField({name: 'collectionSubtitle', title: 'Collection Gallery — Subheading', type: 'text', group: 'pageHeaders'}),
  ],
  preview: {
    prepare() {
      return {title: 'Site Content'};
    },
  },
});
