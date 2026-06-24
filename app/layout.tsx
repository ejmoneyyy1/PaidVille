import type {Metadata, Viewport} from 'next';
import {Inter, Montserrat} from 'next/font/google';
import './globals.css';
import {Analytics} from '@vercel/analytics/next';
import {SiteConfig} from '@/lib/config';
import VisualEditingClient from '@/components/VisualEditingClient';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SiteConfig.name} – ${SiteConfig.tagline}`,
    template: `%s | ${SiteConfig.name}`,
  },
  description: SiteConfig.description,
  keywords: [
    'PaidVille',
    'Fayetteville events',
    'Arkansas events',
    'premium events',
    'elevated lifestyle',
    'event planning Fayetteville AR',
    'nightlife Arkansas',
    'PaidVille Productions',
    'lifestyle brand',
    'creative agency Arkansas',
    'exclusive events',
    'members only',
    'Fayetteville nightlife',
    'AR entertainment',
  ],
  authors: [{name: 'PaidVille', url: SiteConfig.url}],
  creator: 'PaidVille',
  publisher: 'PaidVille',
  metadataBase: new URL(SiteConfig.url),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SiteConfig.url,
    siteName: SiteConfig.name,
    title: `${SiteConfig.name} – ${SiteConfig.tagline}`,
    description: SiteConfig.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PaidVille – Premium Events. Elevated Lifestyle.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@paidville',
    creator: '@paidville',
    title: `${SiteConfig.name} – ${SiteConfig.tagline}`,
    description: SiteConfig.description,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      {url: '/favicon.ico'},
      {url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png'},
      {url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png'},
    ],
    apple: [{url: '/apple-touch-icon.png', sizes: '180x180'}],
    other: [
      {rel: 'icon', url: '/icon-192.png', sizes: '192x192'},
      {rel: 'icon', url: '/icon-512.png', sizes: '512x512'},
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  colorScheme: 'dark',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        {children}
        <VisualEditingClient />
        <Analytics />
      </body>
    </html>
  );
}
