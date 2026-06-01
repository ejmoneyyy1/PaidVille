'use client';

import {motion, useReducedMotion} from 'framer-motion';
import {useInquiry} from '@/components/inquiry/InquiryProvider';

export default function FloatingJoinButton() {
  const {openJoin} = useInquiry();
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className="fixed right-0 top-1/2 z-[100]"
      initial={{y: '-50%'}}
      animate={prefersReduced ? {y: '-50%'} : {y: '-50%', scale: [1, 1.05, 1]}}
      transition={prefersReduced ? undefined : {duration: 3, ease: 'easeInOut', repeat: Infinity}}
    >
      <button
        type="button"
        onClick={() => openJoin()}
        className="flex min-h-[148px] w-[58px] cursor-pointer flex-col items-center justify-center rounded-l-[4px] border-0 px-2 py-5 text-white shadow-[-4px_0_20px_rgba(176,0,0,0.45)] transition-transform duration-200 ease-in-out hover:-translate-x-1"
        style={{
          backgroundColor: '#B00000',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
        aria-label="Join now — join the PaidVille family"
      >
        <span className="text-[11px] font-bold uppercase tracking-[3px]">JOIN NOW</span>
      </button>
    </motion.div>
  );
}
