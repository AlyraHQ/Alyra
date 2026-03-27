// frontend/app/register/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../lib/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', pin: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)) {
      setError('PIN must be exactly 4 digits'); return;
    }
    setLoading(true); setError('');
    try {
      await authAPI.register(form);
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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

      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Create account</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '15px' }}>Start buying energy tokens today</p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label>Full name</label>
          <input type="text" placeholder="Ngozi Adeyemi" value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })} autoComplete="name" />
        </div>
        <div>
          <label>Phone number</label>
          <input type="tel" placeholder="08012345678" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} required autoComplete="tel" />
        </div>
        <div>
          <label>Create a 4-digit PIN</label>
          <input type="password" placeholder="Choose a PIN you'll remember" maxLength={4} value={form.pin}
            onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })} required inputMode="numeric" />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>You will use this PIN to confirm payments</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
          {loading ? <><div className="spinner" /><span>Creating account...</span></> : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  );
}