import IntroSequence from '@/components/IntroSequence';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {InquiryProvider} from '@/components/inquiry/InquiryProvider';
import {AdminProvider} from '@/contexts/AdminContext';
import AdminToolbar from '@/components/admin/AdminToolbar';
import AdminPanel from '@/components/admin/AdminPanel';
import {getSiteContent} from '@/lib/get-site-content';
import {getSingletonDocs} from '@/lib/get-singleton-docs';
import {buildNavItems} from '@/lib/build-nav-items';
import FloatingJoinButton from '@/components/ui/FloatingJoinButton';
import SmoothScroll from '@/components/ui/SmoothScroll';
import ScrollProgress from '@/components/ui/ScrollProgress';
import MorphBackgroundMount from '@/components/ui/MorphBackgroundMount';

export default async function PublicLayout({children}: {children: React.ReactNode}) {
  const siteContent = await getSiteContent();
  const {navigation, globalSettings} = await getSingletonDocs();
  const navItems = buildNavItems(navigation);

  return (
    <InquiryProvider>
      <AdminProvider>
        <MorphBackgroundMount />
        <SmoothScroll />
        <ScrollProgress />
        <IntroSequence splashVideoUrl={siteContent?.splashVideoUrl ?? null} />
        <Navbar navItems={navItems} />
        {/* No positive z-index here: the cosmos/scrim use negative z, so content
            already sits above them. Keeping main at the base stacking context lets
            in-page modals (product lightbox, etc.) layer above the navbar. */}
        <main className="relative">{children}</main>
        <Footer siteContent={siteContent} globalSettings={globalSettings} navItems={navItems} />
        <FloatingJoinButton />
        <AdminToolbar />
        <AdminPanel />
      </AdminProvider>
    </InquiryProvider>
  );
}
