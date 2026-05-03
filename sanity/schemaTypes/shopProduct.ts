import {defineField, defineType} from 'sanity';

export const shopProductType = defineType({
  name: 'shopProduct',
  title: 'Shop / Pre-Order',
  type: 'document',
  fields: [
    defineField({
      name: 'productName',
      type: 'string',
      title: 'Product name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 4,
    }),
    defineField({
      name: 'price',
      type: 'number',
      title: 'Price (USD)',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'stripePaymentLink',
      type: 'url',
      title: 'Stripe Payment Link',
      validation: (Rule) =>
        Rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'isAvailable',
      type: 'boolean',
      title: 'Available / pre-order open',
      initialValue: true,
    }),
    defineField({
      name: 'productImage',
      type: 'image',
      title: 'Product image',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', type: 'string', title: 'Alt text'}),
      ],
    }),
    defineField({
      name: 'featuredOnHome',
      type: 'boolean',
      title: 'Featured on homepage Members Shop card',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'productName', media: 'productImage', price: 'price'},
    prepare({title, media, price}) {
      return {
        title: title ?? 'Product',
        subtitle: typeof price === 'number' ? `$${price}` : '',
        media,
      };
    },
  },
});
