'use client';

import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

export interface PanelConfig {
  documentId: string;
  field: string;
  label: string;
  value: unknown;
  type: 'text' | 'textarea' | 'number' | 'image' | 'richtext';
}

interface AdminContextType {
  isAdmin: boolean;
  isEditing: boolean;
  toggleEditing: () => void;
  activePanel: PanelConfig | null;
  openPanel: (config: PanelConfig) => void;
  closePanel: () => void;
  saveField: (documentId: string, field: string, value: unknown) => Promise<void>;
  deleteDocument: (documentId: string, redirectTo?: string) => Promise<void>;
  isSaving: boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({
  children,
  isAdmin: serverIsAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  // Detect admin client-side so the server layout never needs cookies()
  const [isAdmin, setIsAdmin] = useState(serverIsAdmin);
  const [isEditing, setIsEditing] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const adminFromCookie = document.cookie.split(';').some((c) => c.trim() === 'pv_admin_ui=true');
    setIsAdmin(adminFromCookie);
    if (adminFromCookie) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') setIsEditing(true);
    }
  }, []);

  // ISR serves stale-while-revalidate: the first request after a save still
  // gets the old page while the new one builds. Prime regeneration with a
  // throwaway fetch, give it a beat, then refresh to pull the fresh payload.
  const refreshFresh = useCallback(async () => {
    try {
      await fetch(window.location.pathname, {cache: 'no-store'});
      await new Promise((resolve) => setTimeout(resolve, 400));
    } catch {
      // best-effort prime; refresh regardless
    }
    router.refresh();
  }, [router]);

  const saveField = useCallback(
    async (documentId: string, field: string, value: unknown) => {
      setIsSaving(true);
      try {
        const res = await fetch('/api/admin/update', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({documentId, field, value}),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Save failed');
        }
        await refreshFresh();
      } finally {
        setIsSaving(false);
      }
    },
    [refreshFresh],
  );

  const deleteDocument = useCallback(
    async (documentId: string, redirectTo?: string) => {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({documentId}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Delete failed');
      }
      if (typeof window !== 'undefined' && redirectTo) {
        window.location.assign(redirectTo);
        return;
      }
      await refreshFresh();
    },
    [router, refreshFresh],
  );

  const value: AdminContextType = {
    isAdmin,
    isEditing,
    toggleEditing: () => setIsEditing((p) => !p),
    activePanel,
    openPanel: setActivePanel,
    closePanel: () => setActivePanel(null),
    saveField,
    deleteDocument,
    isSaving,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return ctx;
}
