import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { SiteConfig } from '@/lib/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IntroSequence from '@/components/IntroSequence';

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
  authors: [{ name: 'PaidVille' }],
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
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body>
        <IntroSequence />
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
