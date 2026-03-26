'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(phone, pin);
      localStorage.setItem('alyra_token', res.data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(83,74,183,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32 }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#534AB7', margin: '8px 0 4px' }}>Welcome back</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Enter your phone and PIN</p>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 14px', color: '#c62828', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>Phone Number</label>
          <input
            type="tel"
            placeholder="+234 808 123 4567"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0deff', fontSize: 15, marginBottom: 16, outline: 'none', boxSizing: 'border-box' }}
          />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>4-digit PIN</label>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={4}
            required
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0deff', fontSize: 15, marginBottom: 24, outline: 'none', boxSizing: 'border-box', letterSpacing: 8 }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? '#9990d4' : '#534AB7', color: '#fff', padding: '14px', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#534AB7', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </main>
  );
}