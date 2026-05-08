/** Fallback stock posts use numeric ids like `stock-1` (not in Sanity). */
export function isSanityBlogPost(post: {_id: string}): boolean {
  return Boolean(post._id && !/^stock-\d+$/.test(post._id));
}
