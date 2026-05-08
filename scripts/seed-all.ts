import {createClient} from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config({path: '.env.local'});

const globalSettings = {
  _id: 'singleton-global-settings',
  _type: 'globalSettings',
  siteName: 'PaidVille',
  contactEmail: 'hello@paidville.com',
  footerTagline: 'Est. 2018 — ARK USA | Fayetteville, AR',
  footerDescription: 'Premium events. Elevated lifestyle. Based in Fayetteville, AR.',
  defaultSeoTitle: 'PaidVille — Premium Events. Elevated Lifestyle.',
  defaultSeoDescription:
    'PaidVille is a creative agency based in Fayetteville, AR specializing in premium events, branding, and community engagement.',
};

const navigation = {
  _id: 'singleton-navigation',
  _type: 'navigation',
  ctaButtonText: 'Shop',
  links: [
    {_key: 'nav-services', label: 'Services', path: '/#services'},
    {_key: 'nav-events', label: 'Events', path: '/events'},
    {_key: 'nav-about', label: 'About', path: '/about'},
    {_key: 'nav-gallery', label: 'Gallery', path: '/gallery'},
    {_key: 'nav-blog', label: 'Blog', path: '/blog'},
    {_key: 'nav-shop', label: 'Shop', path: '/shop'},
  ],
};

const homepage = {
  _id: 'singleton-homepage',
  _type: 'page',
  title: 'Homepage',
  slug: {_type: 'slug', current: 'home'},
  isHomepage: true,
  sections: [
    {
      _type: 'heroBlock',
      _key: 'hero-1',
      tagline: 'PREMIUM EVENTS. ELEVATED LIFESTYLE.',
      subtext: 'CREATIVE AGENCY · FAYETTEVILLE',
      primaryButtonText: 'Get Started',
      secondaryButtonText: 'Watch Reel',
    },
    {
      _type: 'statsBlock',
      _key: 'stats-1',
      ticketsSold: 10000,
      eventsHosted: 50,
      rating: 5,
    },
    {
      _type: 'servicesBlock',
      _key: 'services-1',
      heading: 'Services Built for the Culture',
      subheading: 'From the stage to the street — immersive strategy, production, and brand elevation.',
      services: [
        {
          _key: 'svc-1',
          title: 'Events & Entertainment',
          description:
            'FROM INTIMATE GATHERINGS TO LARGE SCALE PRODUCTIONS, LET US CRAFT YOUR NEXT UNFORGETTABLE EXPERIENCE',
          buttonText: 'Experience Now',
          buttonAction: 'events',
          icon: 'events',
        },
        {
          _key: 'svc-2',
          title: 'Branding',
          description:
            'Your brand is priceless. With our professional approach, spanning marketing and analytics, we will amplify your brand story.',
          buttonText: 'Elevate Now',
          buttonAction: 'branding',
          icon: 'branding',
        },
        {
          _key: 'svc-3',
          title: 'Clothing',
          description: 'Rep the culture. Shop the PaidVille collection.',
          buttonText: 'Shop Now',
          buttonAction: 'shop',
          icon: 'clothing',
        },
        {
          _key: 'svc-4',
          title: 'Community Engagement',
          description: 'Giving back to the community that built us.',
          buttonText: 'Give Now',
          buttonAction: 'donate',
          icon: 'community',
        },
      ],
    },
    {
      _type: 'galleryStripBlock',
      _key: 'gallery-1',
      heading: 'The Gallery',
      subheading: 'Moments & Memories',
      maxPhotos: 6,
    },
    {
      _type: 'eventsBlock',
      _key: 'events-1',
      heading: 'Upcoming Events',
      subheading: "Don't miss what's next",
      maxEvents: 6,
    },
    {
      _type: 'shopBlock',
      _key: 'shop-1',
      heading: 'Pre-order the drop',
      subheading: 'Pricing and checkout live on Stripe.',
      buttonText: 'Full Shop',
    },
    {
      _type: 'blogBlock',
      _key: 'blog-1',
      heading: 'Biased Opinions',
      subheading: 'Editorial',
      maxPosts: 3,
    },
  ],
};

const eventsPage = {
  _id: 'page-events',
  _type: 'page',
  title: 'Events',
  slug: {_type: 'slug', current: 'events'},
  isHomepage: false,
  sections: [
    {
      _type: 'ctaBannerBlock',
      _key: 'events-hero',
      text: 'UPCOMING EVENTS',
      buttonText: null,
      backgroundColor: 'dark',
    },
    {
      _type: 'eventsBlock',
      _key: 'events-list',
      heading: 'All Events',
      subheading: "Don't miss what's next",
      maxEvents: 24,
    },
  ],
};

const galleryPage = {
  _id: 'page-gallery',
  _type: 'page',
  title: 'Gallery',
  slug: {_type: 'slug', current: 'gallery'},
  isHomepage: false,
  sections: [
    {
      _type: 'ctaBannerBlock',
      _key: 'gallery-hero',
      text: 'THE GALLERY',
      buttonText: null,
      backgroundColor: 'dark',
    },
    {
      _type: 'galleryStripBlock',
      _key: 'gallery-full',
      heading: 'Moments & Memories',
      subheading: 'Every unforgettable PaidVille experience',
      maxPhotos: 50,
    },
  ],
};

const shopPage = {
  _id: 'page-shop',
  _type: 'page',
  title: 'Shop',
  slug: {_type: 'slug', current: 'shop'},
  isHomepage: false,
  sections: [
    {
      _type: 'shopBlock',
      _key: 'shop-main',
      heading: 'Members Shop',
      subheading: 'Rep the culture. Shop the PaidVille collection.',
      buttonText: 'View All',
    },
  ],
};

const client = createClient({
  projectId: 'qxv0mc90',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function seedAll() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing SANITY_API_WRITE_TOKEN in .env.local');
    process.exit(1);
  }

  const documents = [globalSettings, navigation, homepage, eventsPage, galleryPage, shopPage];

  for (const doc of documents) {
    await client.createOrReplace(doc);
    console.log(`✅ Seeded: ${doc._id}`);
  }

  console.log('');
  console.log('All documents seeded successfully!');
  console.log('Go to paidville-studio.sanity.studio');
  console.log('All pages are ready with clean IDs');
  console.log('On-site dashboard will target these IDs directly');
}

seedAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
