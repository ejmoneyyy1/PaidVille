import {blogType} from './blog';
import {collectionImageType} from './collectionImage';
import {eventType} from './event';
import {galleryType} from './gallery';
import {inquirySubmissionType} from './inquirySubmission';
import {reviewType} from './review';
import {shopProductType} from './shopProduct';
import {siteContentType} from './siteContent';
import {siteStatsType} from './siteStats';

export const schemaTypes = [
  siteContentType,
  siteStatsType,
  blogType,
  eventType,
  shopProductType,
  collectionImageType,
  inquirySubmissionType,
  reviewType,
  galleryType,
];
