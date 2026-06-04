import {defineField, defineType} from 'sanity';

export const collectionImageType = defineType({
  name: 'collectionImage',
  title: 'Shop Collection Image',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title / caption',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 3,
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', media: 'image'},
  },
});
