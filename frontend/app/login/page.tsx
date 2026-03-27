// frontend/app/login/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', pin: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await authAPI.login(form);
      localStorage.setItem('access_token', data.access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid phone or PIN');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <Link href="/" className="logo" style={{ marginBottom: '40px', textDecoration: 'none' }}>
        <div className="logo-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
        </div>
        <span className="logo-text">Alyra</span>
      </Link>

      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Sign in</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '15px' }}>Welcome back to your account</p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label>Phone number</label>
          <input type="tel" placeholder="08012345678" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} required autoComplete="tel" />
        </div>
        <div>
          <label>PIN</label>
          <input type="password" placeholder="Enter your 4-digit PIN" maxLength={4} value={form.pin}
            onChange={e => setForm({ ...form, pin: e.target.value })} required autoComplete="current-password" inputMode="numeric" />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
          {loading ? <><div className="spinner" /><span>Signing in...</span></> : 'Sign in'}
        </button>
      </form>

      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        No account?{' '}
        <Link href="/register" style={{ color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
      </p>
    </div>
  );
}