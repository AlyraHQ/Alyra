'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await api.login(phone, pin);
      localStorage.setItem('alyra_token', data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid phone or PIN');
    } finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <Link href="/" style={{ color: '#1a56db', fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'block', marginBottom: 28 }}>Alyra</Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Sign in</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Enter your phone number and PIN</p>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 14, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Phone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07012345678" required
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', marginBottom: 16, boxSizing: 'border-box' as const }} />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>4-digit PIN</label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} placeholder="Enter your PIN" required
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', marginBottom: 24, boxSizing: 'border-box' as const, letterSpacing: 6 }} />

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#93c5fd' : '#1a56db', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          No account? <Link href="/register" style={{ color: '#1a56db', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </main>
  );
}