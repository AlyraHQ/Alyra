'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', pin: '', full_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    setLoading(true);
    setError('');
    try {
      await api.register(form.phone, form.pin, form.full_name);
      const res = await api.login(form.phone, form.pin);
      localStorage.setItem('alyra_token', res.data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <main style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(83,74,183,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32 }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#534AB7', margin: '8px 0 4px' }}>Join Alyra</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Get started with solar energy today</p>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 14px', color: '#c62828', fontSize: 14, marginBottom: 16 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', field: 'full_name', type: 'text', placeholder: 'Mama Ngozi' },
            { label: 'Phone Number', field: 'phone', type: 'tel', placeholder: '+234 808 123 4567' },
            { label: '4-digit PIN', field: 'pin', type: 'password', placeholder: '••••' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={update(field)}
                maxLength={field === 'pin' ? 4 : undefined}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0deff', fontSize: 15, outline: 'none', boxSizing: 'border-box', letterSpacing: field === 'pin' ? 8 : 0 }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? '#9990d4' : '#534AB7', color: '#fff', padding: '14px', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
          Already registered?{' '}
          <Link href="/login" style={{ color: '#534AB7', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}