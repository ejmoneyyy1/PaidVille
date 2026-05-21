'use client';

import {useInquiry} from '@/components/inquiry/InquiryProvider';

export default function FloatingJoinButton() {
  const {openEvent} = useInquiry();

  return (
    <button
      type="button"
      onClick={() => openEvent()}
      className="fixed right-0 top-1/2 z-[100] -translate-y-1/2 cursor-pointer rounded-l border-0 bg-[#B00000] px-[10px] py-4 text-[11px] font-bold uppercase tracking-[3px] text-white shadow-[-2px_0_12px_rgba(176,0,0,0.3)] transition-all duration-200 ease-in-out hover:-translate-x-1 hover:bg-[#900000]"
      style={{writingMode: 'vertical-rl'}}
      aria-label="Join now — open inquiry form"
    >
      JOIN NOW
    </button>
  );
}
