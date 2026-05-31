'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAdmin} from '@/contexts/AdminContext';

export default function AdminPanel() {
  const router = useRouter();
  const {activePanel, closePanel, saveField, isSaving} = useAdmin();
  const [draft, setDraft] = useState<string>('');
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!activePanel) return;
    setDraft(
      activePanel.value === null || activePanel.value === undefined
        ? ''
        : String(activePanel.value),
    );
    setSaveState('idle');
    setErrorMsg('');
  }, [activePanel]);

  if (!activePanel) return null;

  const handleSave = async () => {
    setSaveState('idle');
    setErrorMsg('');
    try {
      let value: string | number | unknown = draft;
      if (activePanel.type === 'number') {
        value = Number(draft);
        if (Number.isNaN(value)) {
          setErrorMsg('Enter a valid number');
          return;
        }
      }
      await saveField(activePanel.documentId, activePanel.field, value);
      setSaveState('saved');
      if (activePanel.field === 'slug' && typeof draft === 'string' && draft.trim()) {
        const next = draft.trim().replace(/^\/+/, '');
        window.setTimeout(() => {
          router.push(`/blog/${next}`);
        }, 400);
      }
      window.setTimeout(() => {
        closePanel();
        setSaveState('idle');
      }, 1500);
    } catch (e) {
      setSaveState('error');
      setErrorMsg(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const inputBase =
    'w-full rounded-[2px] border border-[#444] bg-[#2A2A2A] px-3 py-3 text-base text-white placeholder:text-charcoal/40';

  return (
    <aside
      className="fixed right-0 top-0 z-[9998] flex h-full w-[380px] max-w-[100vw] flex-col border-l border-[#333] bg-charcoal shadow-2xl"
      role="dialog"
      aria-label="Edit field"
    >
      <header className="flex items-start justify-between gap-3 border-b border-[#333] px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">{activePanel.label}</p>
        <button
          type="button"
          onClick={closePanel}
          className="text-brand-red transition-opacity hover:opacity-70"
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {activePanel.type === 'textarea' || activePanel.type === 'richtext' ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className={inputBase}
          />
        ) : activePanel.type === 'number' ? (
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={inputBase}
          />
        ) : activePanel.type === 'image' ? (
          <div className="space-y-2">
            <p className="text-xs text-white/50">
              Paste an image URL or path.
            </p>
            <input
              type="url"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={inputBase}
              placeholder="https://..."
            />
          </div>
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={inputBase}
          />
        )}
        {errorMsg ? <p className="mt-2 text-sm text-brand-red">{errorMsg}</p> : null}
      </div>

      <footer className="border-t border-[#333] px-5 py-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || saveState === 'saved'}
          className="w-full rounded-[2px] bg-brand-red py-3 text-sm font-bold text-white transition-colors hover:bg-[#900000] disabled:opacity-60"
        >
          {saveState === 'saved' ? 'Saved ✓' : isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={closePanel}
          className="mt-3 w-full text-center text-sm text-white/45 transition-colors hover:text-white/70"
        >
          Cancel
        </button>
      </footer>
    </aside>
  );
}
