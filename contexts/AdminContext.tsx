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
  isAdmin: initialIsAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initialIsAdmin || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsEditing(true);
    }
  }, [initialIsAdmin]);

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
        router.refresh();
      } finally {
        setIsSaving(false);
      }
    },
    [router],
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
      router.refresh();
    },
    [router],
  );

  const value: AdminContextType = {
    isAdmin: initialIsAdmin,
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
