/** GROQ fragment for blog `mainImage` with dereferenced asset URL. */
export const blogMainImageProjection = `mainImage {
  _type,
  alt,
  asset->{
    _id,
    _ref,
    url
  }
}`;
