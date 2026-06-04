import {createClient} from '@sanity/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const globalSettings = {
  _id: 'singleton-global-settings',
  _type: 'globalSettings',
  siteName: 'PaidVille',
  contactEmail: 'hstoneco@outlook.com',
  footerTagline: 'Est. 2018 — ARK USA | Fayetteville, AR',
  footerDescription: 'Premium events. Elevated lifestyle. Based in Fayetteville, AR.',
  defaultSeoTitle: 'PaidVille — Premium Events. Elevated Lifestyle.',
  defaultSeoDescription: 'PaidVille is a creative agency based in Fayetteville, AR specializing in premium events, branding, and community engagement.',
}

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
}

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
      heading: 'Services Built to Build',
      subheading: 'From the stage to the street — immersive strategy, production, and brand elevation.',
      services: [
        {
          _key: 'svc-1',
          title: 'Events & Entertainment',
          description: 'FROM INTIMATE GATHERINGS TO LARGE SCALE PRODUCTIONS, LET US CRAFT YOUR NEXT UNFORGETTABLE EXPERIENCE',
          buttonText: 'Experience Now',
          buttonAction: 'events',
          icon: 'events',
        },
        {
          _key: 'svc-2',
          title: 'Branding',
          description: 'Your brand is priceless. With our professional approach, spanning marketing and analytics, we will amplify your brand story.',
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
          description: 'Giving back to the community that built us. How can we be of service?',
          buttonText: 'Plan Now',
          buttonAction: 'community',
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
}

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
}

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
}

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
}

/** Minimal portable text body from excerpt so posts render in Studio / site */
function excerptBody(text: string, key: string) {
  return [
    {
      _type: 'block',
      _key: `${key}-p1`,
      style: 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: `${key}-s1`, marks: [], text}],
    },
  ]
}

const blogPosts = [
  {
    _id: 'stock-blog-1',
    _type: 'blog',
    title: 'PaidVille Is Here — Welcome to Biased Opinions',
    slug: {_type: 'slug', current: 'welcome-to-biased-opinions'},
    author: 'PaidVille',
    publishedAt: '2024-01-15T12:00:00.000Z',
    category: 'CULTURE',
    excerpt:
      'No filter, no fluff — real takes on events, culture, branding, and building something from the ground up in Arkansas.',
    status: 'published',
    body: excerptBody(
      'No filter, no fluff — real takes on events, culture, branding, and building something from the ground up in Arkansas.',
      'b1',
    ),
  },
  {
    _id: 'stock-blog-2',
    _type: 'blog',
    title: 'What Makes an Unforgettable Event?',
    slug: {_type: 'slug', current: 'what-makes-an-unforgettable-event'},
    author: 'PaidVille',
    publishedAt: '2024-02-01T12:00:00.000Z',
    category: 'EVENTS',
    excerpt:
      'From 50-person gatherings to 500-person productions — the elements that make people talk for years.',
    status: 'published',
    body: excerptBody(
      'From 50-person gatherings to 500-person productions — the elements that make people talk for years.',
      'b2',
    ),
  },
  {
    _id: 'stock-blog-3',
    _type: 'blog',
    title: "Your Brand Is Priceless. Stop Treating It Like It Isn't.",
    slug: {_type: 'slug', current: 'your-brand-is-priceless'},
    author: 'PaidVille',
    publishedAt: '2024-02-20T12:00:00.000Z',
    category: 'BRANDING',
    excerpt:
      "Most creatives have already built something remarkable. Here's how PaidVille approaches brand identity.",
    status: 'published',
    body: excerptBody(
      "Most creatives have already built something remarkable. Here's how PaidVille approaches brand identity.",
      'b3',
    ),
  },
  {
    _id: 'stock-blog-4',
    _type: 'blog',
    title: "Fayetteville's Creative Scene Is Bigger Than You Think",
    slug: {_type: 'slug', current: 'fayetteville-creative-scene'},
    author: 'PaidVille',
    publishedAt: '2024-03-05T12:00:00.000Z',
    category: 'COMMUNITY',
    excerpt:
      'ARK USA is sleeping on its own talent. We spotlight the creatives putting Fayetteville on the map.',
    status: 'published',
    body: excerptBody(
      'ARK USA is sleeping on its own talent. We spotlight the creatives putting Fayetteville on the map.',
      'b4',
    ),
  },
]

async function seedAll() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('❌ Missing SANITY_API_WRITE_TOKEN in .env.local')
    process.exit(1)
  }

  const client = createClient({
    projectId: 'qxv0mc90',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  })

  const documents: any[] = [
    globalSettings,
    navigation,
    homepage,
    eventsPage,
    galleryPage,
    shopPage,
    ...blogPosts,
  ]

  console.log('Seeding PaidVille content to Sanity...\n')

  for (const doc of documents) {
    try {
      await client.createOrReplace(doc)
      console.log(`✅ Seeded: ${doc._id}`)
    } catch (err) {
      console.error(`❌ Failed to seed ${doc._id}:`, err)
      process.exit(1)
    }
  }

  console.log('\n🎉 All documents seeded successfully!')
  console.log('📍 Go to paidville-studio.sanity.studio')
  console.log('📄 Pages → Homepage → Publish to activate page builder')
  console.log('🎯 On-site dashboard will target these IDs directly')
}

seedAll().catch(console.error)