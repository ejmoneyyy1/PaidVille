import IntroSequence from '@/components/IntroSequence';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { InquiryProvider } from '@/components/inquiry/InquiryProvider';
import {getSiteContent} from '@/lib/get-site-content';

export default async function PublicLayout({children}: {children: React.ReactNode}) {
  const siteContent = await getSiteContent();

  return (
    <InquiryProvider>
      <IntroSequence />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer siteContent={siteContent} />
    </InquiryProvider>
  );
}
