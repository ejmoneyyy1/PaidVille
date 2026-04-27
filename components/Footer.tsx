import Link from 'next/link';
import { Instagram, Twitter, Youtube, Facebook } from 'lucide-react';
import { SiteConfig } from '@/lib/config';

const socialIcons = {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
} as const;

export default function Footer() {
  return (
    <footer className="relative bg-[#0A0A0A] border-t border-white/5">
      {/* Red accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-60" />

      <div className="container-max section-padding py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div className="space-y-4">
          <span className="font-display font-black text-2xl text-gradient-brand">
            PAID<span className="text-brand-red">VILLE</span>
          </span>
          <p className="text-sm text-brand-text-dim leading-relaxed max-w-xs">
            {SiteConfig.tagline}. Building culture through premium events, media, and community.
          </p>
          <p className="text-xs text-brand-text-dim">{SiteConfig.contact.location}</p>
        </div>

        {/* Navigation */}
        <div>
          <p className="section-label">Navigate</p>
          <ul className="space-y-2">
            {SiteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-brand-text-dim hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Social */}
        <div className="space-y-5">
          <div>
            <p className="section-label">Connect</p>
            <a
              href={`mailto:${SiteConfig.contact.email}`}
              className="text-sm text-brand-text-dim hover:text-white transition-colors duration-200"
            >
              {SiteConfig.contact.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={SiteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-white/10 text-brand-text-dim
                hover:text-white hover:border-brand-red/50 hover:bg-brand-red/10
                transition-all duration-200"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href={SiteConfig.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-white/10 text-brand-text-dim
                hover:text-white hover:border-brand-red/50 hover:bg-brand-red/10
                transition-all duration-200"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href={SiteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-white/10 text-brand-text-dim
                hover:text-white hover:border-brand-red/50 hover:bg-brand-red/10
                transition-all duration-200"
              aria-label="YouTube"
            >
              <Youtube size={16} />
            </a>
            <a
              href={SiteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-white/10 text-brand-text-dim
                hover:text-white hover:border-brand-red/50 hover:bg-brand-red/10
                transition-all duration-200"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 section-padding py-6 flex flex-col sm:flex-row
        items-center justify-between gap-3">
        <p className="text-xs text-brand-text-dim">
          &copy; {new Date().getFullYear()} PaidVille. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-xs text-brand-text-dim hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs text-brand-text-dim hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
