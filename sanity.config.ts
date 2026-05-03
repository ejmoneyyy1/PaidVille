import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {presentationTool} from 'sanity/presentation';
import {defineDocuments} from 'sanity/presentation';
import {getSanityDataset, getSanityProjectId} from './lib/sanity-env';
import {schemaTypes} from './sanity/schemaTypes';
import {structure} from './sanity/deskStructure';

const projectId = getSanityProjectId();
const dataset = getSanityDataset();
const previewBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default defineConfig({
  name: 'default',
  title: 'PaidVille Studio',
  projectId,
  dataset,
  plugins: [
    structureTool({structure}),
    visionTool(),
    presentationTool({
      previewUrl: {
        initial: previewBase,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        mainDocuments: defineDocuments([
          {route: '/', filter: `_type == "siteStats"`},
          {
            route: '/blog/:slug',
            filter: `_type == "blog" && slug.current == $slug`,
          },
          {route: '/blog', filter: `_type == "blog"`},
        ]),
      },
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global' || creationContext.type === 'structure') {
        return prev.filter((item) => item.templateId !== 'inquirySubmission');
      }
      return prev;
    },
  },
});
