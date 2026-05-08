/** Only real Sanity gallery documents can be deleted from the site admin. */
export function isDeletableSanityGalleryEntry(item: {
  _id?: string;
  _type?: string;
  staticSrc?: string | null;
}): boolean {
  if (item.staticSrc) return false;
  const id = item._id;
  if (!id || id.startsWith('fallback-')) return false;
  return item._type === 'gallery' || item._type === 'galleryItem';
}
