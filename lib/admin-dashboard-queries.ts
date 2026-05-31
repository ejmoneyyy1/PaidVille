/** Row shapes consumed by the admin dashboard (file-based storage, mapped in the page). */

export type AdminReviewRow = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published' | string;
  submittedAt: string;
};

export type AdminInquiryRow = {
  _id: string;
  submissionType: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  formData?: {json?: string};
};

export type AdminBlogRow = {
  _id: string;
  title: string;
  slug: string;
  status?: string;
  publishedAt?: string;
};

export type AdminEventRow = {
  _id: string;
  eventName: string;
  date: string;
  location: string;
};

export type AdminGalleryRow = {
  _id: string;
  _type: string;
  title: string;
};
