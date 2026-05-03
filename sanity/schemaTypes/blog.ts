import {defineField, defineType} from 'sanity';

export const blogType = defineType({
  name: 'blog',
  title: 'Biased Opinions',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'string',
      title: 'Author',
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Main image / video poster',
      description: 'Used on cards and as the poster when a hero video URL is set.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'heroVideoUrl',
      type: 'url',
      title: 'Hero video URL (optional)',
      description:
        'Optional. Direct .mp4 / .webm (or any URL the browser can play in a video tag). Shown above the article body; main image is used as poster. No separate “video document” required — same pattern as Gallery.',
    }),
    defineField({
      name: 'body',
      type: 'array',
      title: 'Body',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', media: 'mainImage', status: 'status', heroVideoUrl: 'heroVideoUrl'},
    prepare({title, media, status, heroVideoUrl}) {
      return {
        title: title ?? 'Untitled',
        subtitle: [status, heroVideoUrl ? 'Video' : null].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
