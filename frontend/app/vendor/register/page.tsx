'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';

export default function VendorRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ business_name: '', owner_name: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.registerVendor({ ...form, email: form.email || undefined });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', marginBottom: 16, boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 } as React.CSSProperties;

  if (success) return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 56, height: 56, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>&#10003;</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Vendor registered</h2>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          Your business is now listed. Users can select <strong>{form.business_name}</strong> when registering their devices.
        </p>
        <Link href="/register" style={{ display: 'block', background: '#1a56db', color: '#fff', padding: '13px', borderRadius: 10, fontWeight: 600, textDecoration: 'none', fontSize: 15 }}>
          Register as a user
        </Link>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 440, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <Link href="/" style={{ color: '#1a56db', fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'block', marginBottom: 28 }}>Alyra</Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Register as an Energy Vendor</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Your business will appear for users to select when registering their meter or solar kit.</p>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 14, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Business Name</label>
          <input type="text" value={form.business_name} onChange={update('business_name')} placeholder="IKEDC Authorised Agent" required style={inputStyle} />

          <label style={labelStyle}>Owner / Contact Name</label>
          <input type="text" value={form.owner_name} onChange={update('owner_name')} placeholder="Emeka Okafor" required style={inputStyle} />

          <label style={labelStyle}>Phone Number</label>
          <input type="tel" value={form.phone} onChange={update('phone')} placeholder="08012345678" required style={inputStyle} />

          <label style={labelStyle}>Email <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
          <input type="email" value={form.email} onChange={update('email')} placeholder="info@mybusiness.com" style={inputStyle} />

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#93c5fd' : '#1a56db', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Registering...' : 'Register Business'}
          </button>
        </form>
      </div>
    </main>
  );
}