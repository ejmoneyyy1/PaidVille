'use client';

import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import InquiryModal from '@/components/inquiry/InquiryModal';

type InquiryContextValue = {
  openEvent: () => void;
  openBranding: () => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) {
    throw new Error('useInquiry must be used within InquiryProvider');
  }
  return ctx;
}

export function InquiryProvider({children}: {children: React.ReactNode}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'event' | 'branding'>('event');

  const openEvent = useCallback(() => {
    setMode('event');
    setOpen(true);
  }, []);

  const openBranding = useCallback(() => {
    setMode('branding');
    setOpen(true);
  }, []);

  const value = useMemo(() => ({openEvent, openBranding}), [openEvent, openBranding]);

  return (
    <InquiryContext.Provider value={value}>
      {children}
      <InquiryModal open={open} mode={open ? mode : null} onClose={() => setOpen(false)} />
    </InquiryContext.Provider>
  );
}
