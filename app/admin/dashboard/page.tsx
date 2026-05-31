import {getAllProducts} from '@/lib/shop-storage';
import type {ShopProduct} from '@/lib/shop-storage';
import {getAllReviews} from '@/lib/review-storage';
import {getAllInquiries} from '@/lib/inquiry-storage';
import {getAllPosts} from '@/lib/blog-storage';
import {getAllEvents} from '@/lib/event-storage';
import {getAllItems} from '@/lib/gallery-storage';
import type {
  AdminBlogRow,
  AdminEventRow,
  AdminGalleryRow,
  AdminInquiryRow,
  AdminReviewRow,
} from '@/lib/admin-dashboard-queries';
import AdminDashboardClient from '@/components/admin/dashboard/AdminDashboardClient';

export const metadata = {
  title: 'Dashboard',
  robots: 'noindex',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let reviews: AdminReviewRow[] = [];
  let inquiries: AdminInquiryRow[] = [];
  let blogs: AdminBlogRow[] = [];
  let events: AdminEventRow[] = [];
  let gallery: AdminGalleryRow[] = [];
  let shopProducts: ShopProduct[] = [];

  try {
    reviews = getAllReviews().map((r) => ({
      _id: r.id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      submittedAt: r.submittedAt,
    }));

    inquiries = getAllInquiries().map((i) => ({
      _id: i.id,
      submissionType: i.submissionType,
      name: i.name,
      email: i.email,
      phone: i.phone,
      submittedAt: i.submittedAt,
      formData: {json: JSON.stringify(i.formData, null, 2)},
    }));

    blogs = getAllPosts().map((b) => ({
      _id: b.id,
      title: b.title,
      slug: b.slug,
      status: 'published',
      publishedAt: b.publishedAt,
    }));

    events = getAllEvents().map((e) => ({
      _id: e.id,
      eventName: e.eventName,
      date: e.date,
      location: e.location,
    }));

    gallery = getAllItems().map((g) => ({
      _id: g.id,
      _type: g.mediaType,
      title: g.title,
    }));

    shopProducts = getAllProducts();
  } catch (e) {
    console.error('[admin/dashboard]', e);
  }

  return (
    <AdminDashboardClient
      reviews={reviews}
      inquiries={inquiries}
      blogs={blogs}
      events={events}
      gallery={gallery}
      shopProducts={shopProducts}
    />
  );
}
