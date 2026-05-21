import {defineField, defineType} from 'sanity';

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'eventName',
      type: 'string',
      title: 'Event name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      type: 'datetime',
      title: 'Date & time',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'string',
      title: 'Location',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Main image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (legacy)',
      options: {hotspot: true},
      hidden: ({document}) => Boolean(document?.mainImage),
    }),
    defineField({
      name: 'eventbriteUrl',
      type: 'url',
      title: 'Eventbrite URL',
      validation: (Rule) => Rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 4,
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      title: 'Featured',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'eventName', media: 'mainImage', fallback: 'image', date: 'date'},
    prepare({title, media, fallback, date}) {
      return {
        title: title ?? 'Event',
        subtitle: date ? new Date(date).toLocaleString() : '',
        media: media ?? fallback,
      };
    },
  },
});
