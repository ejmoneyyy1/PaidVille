/** Hosted Studio base URL for quick-create links from the admin toolbar */
export function getSanityStudioUrl() {
  return process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? 'https://paidville-studio.sanity.studio';
}
