import {cookies} from 'next/headers';
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
import CustomCursor from '@/components/ui/CustomCursor';
import ScrollProgress from '@/components/ui/ScrollProgress';

export default async function PublicLayout({children}: {children: React.ReactNode}) {
  const siteContent = await getSiteContent();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';
  const {navigation, globalSettings} = await getSingletonDocs();
  const navItems = buildNavItems(navigation);

  return (
    <InquiryProvider>
      <AdminProvider isAdmin={isAdmin}>
        <SmoothScroll />
        <ScrollProgress />
        <CustomCursor />
        <IntroSequence />
        <Navbar navItems={navItems} />
        <main className="relative">{children}</main>
        <Footer siteContent={siteContent} globalSettings={globalSettings} navItems={navItems} />
        <FloatingJoinButton />
        <AdminToolbar />
        <AdminPanel />
      </AdminProvider>
    </InquiryProvider>
  );
}
