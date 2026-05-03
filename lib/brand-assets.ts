/** Header / footer rotating marks — files live under `public/images/`. */
export const BRAND_LOGO_SOURCES = [
  '/images/logo.png',
  '/images/logo2.png',
  '/images/logo3.jpg',
  '/images/splashlogo.png',
] as const;

export type BrandLogoSrc = (typeof BRAND_LOGO_SOURCES)[number];
