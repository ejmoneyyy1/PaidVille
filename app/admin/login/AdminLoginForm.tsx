'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';

export default function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password}),
      });
      if (res.ok) {
        const next = searchParams.get('next');
        const safe =
          next && next.startsWith('/') && !next.startsWith('//')
            ? `${next.split('?')[0]}?admin=true`
            : '/?admin=true';
        router.push(safe);
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === 'string' ? data.error : 'Incorrect password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-[320px] flex-col items-center text-center">
      <div className="relative h-20 w-20">
        <Image src="/images/splashlogo.png" alt="PaidVille" fill className="object-contain" priority />
      </div>
      <p className="mt-6 font-display text-2xl font-black tracking-[0.15em] text-white">PAIDVILLE</p>
      <p className="mt-1 text-[13px] text-white/60">Admin Dashboard</p>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Enter password"
        className="mt-12 w-full rounded-[2px] border border-[#444] bg-[#2A2A2A] px-4 py-3.5 text-base text-white placeholder:text-white/35"
        autoComplete="current-password"
      />

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="mt-3 w-full rounded-[2px] bg-brand-red py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#900000] disabled:opacity-60"
      >
        {loading ? '…' : 'Access Dashboard'}
      </button>

      {error ? <p className="mt-3 text-[13px] text-brand-red">{error}</p> : null}

      <Link href="/" className="mt-10 text-sm text-white/50 transition-colors hover:text-white/70">
        ← Back to site
      </Link>
    </div>
  );
}
