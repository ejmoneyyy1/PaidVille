import {defineField, defineType} from 'sanity';

export const galleryType = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaType',
      type: 'string',
      title: 'Media type',
      options: {
        list: [
          {title: 'Photo', value: 'photo'},
          {title: 'Video', value: 'video'},
        ],
        layout: 'radio',
      },
      initialValue: 'photo',
    }),
    defineField({
      name: 'videoFile',
      type: 'file',
      title: 'Video file',
      description: 'Upload MP4, WebM, or MOV — served from Sanity CDN (no link required).',
      options: {
        accept: 'video/*,.mp4,.webm,.mov,.m4v',
      },
      hidden: ({parent}) => (parent as {mediaType?: string})?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((fileValue, context) => {
          const parent = context.parent as {mediaType?: string};
          if (parent?.mediaType !== 'video') return true;
          const hasFile = Boolean(
            fileValue &&
              typeof fileValue === 'object' &&
              'asset' in fileValue &&
              (fileValue as {asset?: unknown}).asset,
          );
          if (hasFile) return true;
          return 'Upload a video file';
        }),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image / poster',
      description:
        'Required for photos. For videos: optional custom poster; if empty, the site shows a frame from your uploaded video.',
      options: {hotspot: true},
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {mediaType?: string};
          if (parent?.mediaType !== 'video' && !value) {
            return 'Image is required for photos';
          }
          return true;
        }),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Theme / pillar',
      description: 'Shown as a label on the gallery page',
      options: {
        list: [
          {title: 'Gallery', value: 'gallery'},
          {title: 'Events', value: 'events'},
          {title: 'Branding', value: 'branding'},
          {title: 'Community', value: 'community'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'channels',
      type: 'array',
      title: 'Show on',
      description:
        'Choose where this appears. Leave empty for the default: homepage strip and full gallery page.',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Homepage strip', value: 'homepage_gallery'},
          {title: 'Gallery page', value: 'gallery_page'},
          {title: 'Blog', value: 'blog'},
          {title: 'Events', value: 'events'},
        ],
        layout: 'list',
      },
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Sort order',
      description: 'Lower numbers appear first',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {title: 'title', media: 'image', mediaType: 'mediaType'},
    prepare({title, media, mediaType}) {
      return {
        title: title ?? 'Gallery',
        subtitle: mediaType === 'video' ? 'Video' : 'Photo',
        media,
      };
    },
  },
});
