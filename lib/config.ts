export const SiteConfig = {
  name: 'PaidVille',
  tagline: 'Premium Events. Elevated Lifestyle.',
  description:
    'PaidVille is a creative agency and lifestyle brand delivering high-energy experiences through curated events, media, fashion, and community.',
  url: 'https://paidville.com',
  logo: '/images/splashlogo.png',

  brand: {
    primary: '#B00000',
    primaryLight: '#D40000',
    primaryDark: '#800000',
    background: '#F5F5F0',
    surface: '#E5E5E5',
    cardSurface: '#F5F5F0',
    text: '#1A1A1A',
    textDim: '#4A4A4A',
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

  communityGiveUrl: 'https://www.paypal.com/donate',

  nav: [
    {label: 'Services', href: '#services'},
    {label: 'Events', href: '#events'},
    {label: 'About', href: '#about'},
    {label: 'Gallery', href: '/gallery'},
    {label: 'Blog', href: '/blog'},
    {label: 'Shop', href: '/shop'},
  ],

  services: [
    {
      id: 'events',
      title: 'Events & Entertainment',
      description:
        'FROM INTIMATE GATHERINGS TO LARGE SCALE PRODUCTIONS, LET US CRAFT YOUR NEXT UNFORGETTABLE EXPERIENCE',
      icon: 'Zap',
      cta: 'Experience Now',
      inquiryMode: 'event' as const,
    },
    {
      id: 'branding',
      title: 'Branding',
      description:
        'Your brand is priceless. With our professional approach, spanning marketing and analytics, we will amplify your brand story.',
      icon: 'Camera',
      cta: 'Elevate Now',
      inquiryMode: 'branding' as const,
    },
    {
      id: 'shop',
      title: 'Clothing / Members Shop',
      description:
        'Exclusive drops and members-only pieces. Pre-order through our secure Stripe link — updated anytime from our dashboard.',
      icon: 'ShoppingBag',
      cta: 'Shop Now',
      inquiryMode: 'shop' as const,
    },
    {
      id: 'community',
      title: 'Community Engagement',
      description:
        'Building lasting bonds through outreach, partnerships, and grassroots activations that elevate the people around us.',
      icon: 'Users',
      cta: 'Give Now',
      inquiryMode: 'community' as const,
    },
  ],
} as const;

export type NavItem = (typeof SiteConfig.nav)[number];
export type Service = (typeof SiteConfig.services)[number];
