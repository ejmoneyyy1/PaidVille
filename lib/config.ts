export const SiteConfig = {
  name: 'PaidVille',
  tagline: 'Premium Events. Elevated Lifestyle.',
  description:
    'PaidVille is a local event planning and lifestyle brand delivering high-energy experiences through curated events, media, fashion, and community.',
  url: 'https://paidville.com',
  logo: '/images/logo.png',

  brand: {
    primary: '#B00000',
    primaryLight: '#D40000',
    primaryDark: '#800000',
    background: '#0A0A0A',
    surface: '#111111',
    cardSurface: '#1A1A1A',
    text: '#FFFFFF',
    textDim: '#9A9A9A',
  },

  social: {
    instagram: 'https://instagram.com/paidville',
    twitter: 'https://twitter.com/paidville',
    facebook: 'https://facebook.com/paidville',
    youtube: 'https://youtube.com/@paidville',
    tiktok: 'https://tiktok.com/@paidville',
  },

  contact: {
    email: 'hello@paidville.com',
    phone: '',
    location: 'Fayetteville, AR',
  },

  nav: [
    { label: 'Services', href: '#services' },
    { label: 'Events', href: '#events' },
    { label: 'About', href: '#about' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
    { label: 'Shop', href: '/shop' },
  ],

  services: [
    {
      id: 'promo',
      title: 'Promo & Entertainment',
      description:
        'From intimate gatherings to large-scale productions, we craft unforgettable entertainment experiences that keep crowds electric all night.',
      icon: 'Zap',
      href: '#events',
      gradient: 'from-red-900 to-brand-black',
    },
    {
      id: 'media',
      title: 'Media',
      description:
        'Professional photography, videography, and content creation that captures every electric moment and amplifies your brand story.',
      icon: 'Camera',
      href: '/gallery',
      gradient: 'from-slate-900 to-brand-black',
    },
    {
      id: 'clothing',
      title: 'Clothing & Receivables',
      description:
        'Exclusive PaidVille merch and collectibles. Wear the brand. Rep the culture. Limited drops that move fast.',
      icon: 'ShoppingBag',
      href: '/shop',
      gradient: 'from-zinc-900 to-brand-black',
    },
    {
      id: 'community',
      title: 'Community Engagement',
      description:
        'Building lasting bonds through outreach, partnerships, and grassroots activations that elevate the people around us.',
      icon: 'Users',
      href: '#about',
      gradient: 'from-neutral-900 to-brand-black',
    },
  ],
} as const;

export type NavItem = (typeof SiteConfig.nav)[number];
export type Service = (typeof SiteConfig.services)[number];
