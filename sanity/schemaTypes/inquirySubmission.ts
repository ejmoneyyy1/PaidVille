import {defineField, defineType} from 'sanity';

export const inquirySubmissionType = defineType({
  name: 'inquirySubmission',
  title: 'Inquiry Submission',
  type: 'document',
  fields: [
    defineField({
      name: 'submissionType',
      type: 'string',
      title: 'Type',
      readOnly: true,
      options: {
        list: [
          {title: 'Event', value: 'event'},
          {title: 'Branding', value: 'branding'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'name', type: 'string', title: 'Name', readOnly: true}),
    defineField({name: 'email', type: 'string', title: 'Email', readOnly: true}),
    defineField({name: 'phone', type: 'string', title: 'Phone', readOnly: true}),
    defineField({
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted at',
      readOnly: true,
    }),
    defineField({
      name: 'formData',
      title: 'Form data',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({
          name: 'json',
          type: 'text',
          title: 'Responses (JSON)',
          rows: 16,
          readOnly: true,
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', type: 'submissionType', at: 'submittedAt'},
    prepare({title, type, at}) {
      return {
        title: title ?? 'Submission',
        subtitle: `${type ?? ''} · ${at ? new Date(at).toLocaleString() : ''}`,
      };
    },
  },
});
