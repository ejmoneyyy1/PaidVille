import type {StructureResolver} from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('PaidVille')
    .items([
      S.listItem()
        .title('Site Stats')
        .id('siteStatsSingleton')
        .child(S.document().schemaType('siteStats').documentId('siteStats')),
      S.divider(),
      S.documentTypeListItem('blog').title('Biased Opinions'),
      S.documentTypeListItem('event').title('Events'),
      S.documentTypeListItem('shopProduct').title('Shop / Pre-Order'),
      S.divider(),
      S.documentTypeListItem('inquirySubmission').title('Inquiry Submissions'),
      S.documentTypeListItem('gallery').title('Gallery'),
    ]);
