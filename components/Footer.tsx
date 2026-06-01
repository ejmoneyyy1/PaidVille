import Link from 'next/link';
import {Instagram, Twitter, Youtube, Facebook} from 'lucide-react';
import {SiteConfig} from '@/lib/config';
import FooterLogoStrip from '@/components/brand/FooterLogoStrip';
import type {SiteContentDoc} from '@/lib/site-content-types';
import type {GlobalSettingsDoc} from '@/lib/get-singleton-docs';
import type {NavItemResolved} from '@/lib/build-nav-items';
import EditableField from '@/components/admin/EditableField';

const GLOBAL_DOC = 'singleton-global-settings';

function TikTokGlyph({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden width={16} height={16}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const socialClass =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-brand-red/40 bg-white/5 text-cream/60 transition-all duration-200 hover:border-brand-red hover:bg-white/10 hover:text-brand-red hover:shadow-[0_4px_16px_rgba(176,0,0,0.25)]';

export default function Footer({
  siteContent,
  globalSettings,
  navItems,
}: {
  siteContent?: SiteContentDoc | null;
  globalSettings?: GlobalSettingsDoc | null;
  navItems: NavItemResolved[];
}) {
  const rawFooterTagline =
    globalSettings?.footerTagline ?? siteContent?.footerTagline ?? SiteConfig.tagline;
  /** Hide legacy CMS copy that duplicated the Carpe Diem motto in the tagline slot. */
  const footerTagline = /carpe\s*diem/i.test(rawFooterTagline) ? SiteConfig.tagline : rawFooterTagline;
  const contactEmail = globalSettings?.contactEmail ?? SiteConfig.contact.email;
  const instagramHref = siteContent?.instagramUrl ?? SiteConfig.social.instagram;
  const twitterHref = siteContent?.twitterUrl ?? SiteConfig.social.twitter;
  const tiktokHref = siteContent?.tiktokUrl ?? SiteConfig.social.tiktok;

  return (
    <footer className="relative overflow-hidden border-t border-brand-red bg-gradient-to-b from-[#0c0c0c] to-[#070707]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(176,0,0,0.07) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(176,0,0,0.05) 0%, transparent 45%)',
        }}
        aria-hidden
      />

      <div className="relative container-max section-padding py-9 md:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
          <div className="space-y-3 lg:col-span-5">
            <div className="inline-flex flex-col gap-1">
              <span className="font-display text-xl font-black tracking-tight text-cream md:text-2xl">
                PAID<span className="text-brand-red">VILLE</span>
              </span>
              <span className="h-px w-12 bg-brand-red/80" aria-hidden />
            </div>
            <EditableField
              documentId={GLOBAL_DOC}
              field="footerTagline"
              label="Footer tagline (short site description)"
              value={globalSettings?.footerTagline ?? footerTagline}
              type="textarea"
              wrapperClassName="relative block max-w-sm group/edit"
            >
              <p className="max-w-sm text-sm leading-snug text-cream/65">{footerTagline}</p>
            </EditableField>
            <p className="text-[11px] font-display font-semibold uppercase tracking-[0.18em] text-cream/40">
              Est. 2018 — ARK USA · Fayetteville, AR
            </p>
            <FooterLogoStrip />
          </div>

          <div className="lg:col-span-3">
            <p className="mb-3 text-[10px] font-display font-bold uppercase tracking-[0.22em] text-brand-red">
              Navigate
            </p>
            <ul className="columns-2 gap-x-6 gap-y-1.5 text-sm [column-fill:_balance]">
              {navItems.map((item) => (
                <li key={item._key} className="break-inside-avoid py-0.5">
                  <Link
                    href={item.href}
                    className="text-cream/55 transition-colors duration-200 hover:text-brand-red"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="mb-3 text-[10px] font-display font-bold uppercase tracking-[0.22em] text-brand-red">
              Connect
            </p>
            <EditableField
              documentId={GLOBAL_DOC}
              field="contactEmail"
              label="Contact email"
              value={contactEmail}
              type="text"
              wrapperClassName="relative inline-block group/edit"
            >
              <a
                href={`mailto:${contactEmail}`}
                className="inline-block text-sm font-medium text-brand-red transition-opacity hover:opacity-80"
              >
                {contactEmail}
              </a>
            </EditableField>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={instagramHref} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href={tiktokHref} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="TikTok">
                <TikTokGlyph className="size-4" />
              </a>
              <a href={twitterHref} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href={SiteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="YouTube">
                <Youtube size={16} />
              </a>
              <a href={SiteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="Facebook">
                <Facebook size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-brand-red/30 pt-5 sm:flex-row">
          <p className="text-[11px] text-cream/40">&copy; {new Date().getFullYear()} PaidVille. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-[11px] text-cream/40 transition-colors hover:text-brand-red">
              Privacy
            </Link>
            <Link href="/terms" className="text-[11px] text-cream/40 transition-colors hover:text-brand-red">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
