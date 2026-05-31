/** Shape of the editable site copy stored in data/site-content.json. */
export type SiteContentDoc = {
  _id?: string;
  heroTagline?: string | null;
  heroSubtext?: string | null;
  eventsTitle?: string | null;
  eventsDescription?: string | null;
  brandingTitle?: string | null;
  brandingDescription?: string | null;
  clothingTitle?: string | null;
  clothingDescription?: string | null;
  communityTitle?: string | null;
  communityDescription?: string | null;
  aboutText?: string | null;
  footerTagline?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
};
