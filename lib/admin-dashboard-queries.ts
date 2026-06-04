export const adminReviewsQuery = `*[_type == "review" && !(_id in path("drafts.**"))] | order(submittedAt desc) {
  _id,
  name,
  rating,
  comment,
  status,
  submittedAt
}`;

export const adminInquiriesQuery = `*[_type == "inquirySubmission"] | order(submittedAt desc) [0...50] {
  _id,
  submissionType,
  name,
  email,
  phone,
  submittedAt,
  formData
}`;

export const adminBlogListQuery = `*[_type == "blog"] | order(publishedAt desc) [0...30] {
  _id,
  title,
  "slug": slug.current,
  status,
  publishedAt
}`;

export const adminEventsListQuery = `*[_type == "event"] | order(date desc) [0...30] {
  _id,
  eventName,
  date,
  location
}`;

export const adminGalleryListQuery = `*[_type in ["gallery", "galleryItem"]] | order(_updatedAt desc) [0...30] {
  _id,
  _type,
  title
}`;

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
