'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

type Vendor = { id: string; business_name: string; owner_name: string };

export default function RegisterPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [form, setForm] = useState({ phone: '', pin: '', full_name: '', vendor_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listVendors()
      .then(data => setVendors(Array.isArray(data) ? data : []))
      .catch(() => {}); // vendors list failing shouldn't block registration
  }, []);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    setLoading(true); setError('');
    try {
      await api.register({
        phone: form.phone,
        pin: form.pin,
        full_name: form.full_name,
        vendor_id: form.vendor_id || undefined,
      });
      const data = await api.login(form.phone, form.pin);
      localStorage.setItem('alyra_token', data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', marginBottom: 16, boxSizing: 'border-box' as const, background: '#fff' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 } as React.CSSProperties;

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 440, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <Link href="/" style={{ color: '#1a56db', fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'block', marginBottom: 28 }}>Alyra</Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Create your account</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Access smart energy payments in minutes</p>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 14, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Full Name</label>
          <input type="text" value={form.full_name} onChange={update('full_name')} placeholder="Ngozi Adeyemi" required style={inputStyle} />

          <label style={labelStyle}>Phone Number</label>
          <input type="tel" value={form.phone} onChange={update('phone')} placeholder="07012345678" required style={inputStyle} />

          <label style={labelStyle}>4-digit PIN</label>
          <input type="password" value={form.pin} onChange={update('pin')} maxLength={4} placeholder="Choose a PIN" required style={{ ...inputStyle, letterSpacing: 6 }} />

          <label style={labelStyle}>Energy Vendor <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
          <select value={form.vendor_id} onChange={update('vendor_id')}
            style={{ ...inputStyle, color: form.vendor_id ? '#111827' : '#9ca3af' }}>
            <option value="">Select your energy vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.business_name}</option>
            ))}
          </select>

          {vendors.length === 0 && (
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: -12, marginBottom: 16 }}>
              No vendors yet. You can add your device after registering.{' '}
              <Link href="/vendor/register" style={{ color: '#1a56db', textDecoration: 'none' }}>Register a vendor</Link>
            </p>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#93c5fd' : '#1a56db', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          Already registered? <Link href="/login" style={{ color: '#1a56db', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}