import {defineField, defineType} from 'sanity';

export const siteStatsType = defineType({
  name: 'siteStats',
  title: 'Site Stats',
  type: 'document',
  fields: [
    defineField({
      name: 'ticketsSold',
      type: 'number',
      title: 'Tickets sold (display)',
      description: 'Shown as a label, e.g. use 10000 for “10k+ Tickets Sold”.',
      initialValue: 10000,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'eventsHosted',
      type: 'number',
      title: 'Events hosted (display)',
      description: 'Integer for “50+ Events Hosted”.',
      initialValue: 50,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      title: 'Star rating',
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
  ],
});
