import type {Metadata, Viewport} from 'next';
import {Inter, Montserrat} from 'next/font/google';
import './globals.css';
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
  keywords: ['events', 'entertainment', 'lifestyle', 'Fayetteville', 'Arkansas', 'PaidVille', 'media', 'clothing'],
  authors: [{name: 'PaidVille'}],
  creator: 'PaidVille',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SiteConfig.url,
    siteName: SiteConfig.name,
    title: `${SiteConfig.name} – ${SiteConfig.tagline}`,
    description: SiteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SiteConfig.name} – ${SiteConfig.tagline}`,
    description: SiteConfig.description,
    creator: '@paidville',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#F5F5F0',
  colorScheme: 'light',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen">
        {children}
        <VisualEditingClient />
      </body>
    </html>
  );
}
