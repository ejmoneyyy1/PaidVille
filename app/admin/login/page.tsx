import {Suspense} from 'react';
import AdminLoginForm from './AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{backgroundColor: '#1A1A1A'}}
    >
      <Suspense fallback={<p className="text-sm text-white/60">Loading…</p>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
