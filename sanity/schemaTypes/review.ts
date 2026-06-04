import {defineField, defineType} from 'sanity';

export const reviewType = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      title: 'Rating (1–5)',
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'comment',
      type: 'text',
      title: 'Comment',
      rows: 4,
      validation: (Rule) => Rule.required().min(10).max(2000),
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      options: {
        list: [
          {title: 'Pending approval', value: 'pending'},
          {title: 'Published on site', value: 'published'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted at',
      readOnly: true,
    }),
  ],
  preview: {
    select: {name: 'name', rating: 'rating', status: 'status', comment: 'comment'},
    prepare({name, rating, status, comment}) {
      const stars = typeof rating === 'number' ? `${rating}/5` : '';
      return {
        title: name ?? 'Review',
        subtitle: [stars, status].filter(Boolean).join(' · '),
        description: comment ? comment.slice(0, 80) : '',
      };
    },
  },
});
