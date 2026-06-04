import {getAllProducts} from '@/lib/shop-storage';
import type {ShopProduct} from '@/lib/shop-storage';
import {getSanityClient} from '@/lib/sanity-server';
import {
  adminBlogListQuery,
  adminEventsListQuery,
  adminGalleryListQuery,
  adminInquiriesQuery,
  adminReviewsQuery,
  type AdminBlogRow,
  type AdminEventRow,
  type AdminGalleryRow,
  type AdminInquiryRow,
  type AdminReviewRow,
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
    const client = await getSanityClient();
    [reviews, inquiries, blogs, events, gallery] = await Promise.all([
      client.fetch<AdminReviewRow[]>(adminReviewsQuery),
      client.fetch<AdminInquiryRow[]>(adminInquiriesQuery),
      client.fetch<AdminBlogRow[]>(adminBlogListQuery),
      client.fetch<AdminEventRow[]>(adminEventsListQuery),
      client.fetch<AdminGalleryRow[]>(adminGalleryListQuery),
    ]);
  } catch (e) {
    console.error('[admin/dashboard]', e);
  }

  // Get shop products from Sanity
  try {
    shopProducts = await getAllProducts();
  } catch (e) {
    console.error('[admin/dashboard shop]', e);
  }

  return (
    <AdminDashboardClient
      reviews={reviews ?? []}
      inquiries={inquiries ?? []}
      blogs={blogs ?? []}
      events={events ?? []}
      gallery={gallery ?? []}
      shopProducts={shopProducts ?? []}
    />
  );
}
