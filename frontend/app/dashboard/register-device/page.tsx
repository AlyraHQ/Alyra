'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';

type Vendor = { id: string; business_name: string };
type User = { vendor_id?: string };

export default function RegisterDevicePage() {
  const router = useRouter();
  const [type, setType] = useState<'grid' | 'solar'>('grid');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorError, setVendorError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    device_name: '', meter_number: '', kit_serial_number: '',
    tariff_kobo_per_kwh: '8500', daily_rate_kobo: '20000',
    state: '', lga: '', vendor_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('alyra_token')) { router.push('/login'); return; }

    // Load user separately from vendors so one failing doesn't block the other
    api.me()
      .then(userData => {
        setUser(userData);
        if (userData.vendor_id) {
          setForm(f => ({ ...f, vendor_id: userData.vendor_id }));
        }
      })
      .catch(() => router.push('/login'));

    // Load vendors independently — show error if it fails
    api.listVendors()
      .then(data => {
        const v: Vendor[] = Array.isArray(data) ? data : [];
        setVendors(v);
        if (v.length > 0) {
          setForm(f => ({ ...f, vendor_id: f.vendor_id || v[0].id }));
        }
      })
      .catch(err => {
        setVendorError(err instanceof Error ? err.message : 'Could not load vendors');
      })
      .finally(() => setVendorsLoading(false));
  }, [router]);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendor_id) { setError('Please select a vendor'); return; }
    setLoading(true); setError('');
    try {
      if (type === 'grid') {
        await api.registerGrid({
          device_name: form.device_name,
          meter_number: form.meter_number,
          tariff_kobo_per_kwh: parseInt(form.tariff_kobo_per_kwh),
          state: form.state || undefined,
          lga: form.lga || undefined,
          vendor_id: form.vendor_id,
        });
      } else {
        await api.registerSolar({
          device_name: form.device_name,
          kit_serial_number: form.kit_serial_number,
          daily_rate_kobo: parseInt(form.daily_rate_kobo),
          state: form.state || undefined,
          lga: form.lga || undefined,
          vendor_id: form.vendor_id,
        });
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register device');
    } finally { setLoading(false); }
  };

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 } as React.CSSProperties;
  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none',
    marginBottom: 16, boxSizing: 'border-box' as const, background: '#fff'
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: 14, cursor: 'pointer', color: '#374151' }}>
          Back
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Register a Device</span>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

        {/* Device type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {(['grid', 'solar'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              style={{
                padding: '14px', borderRadius: 12, cursor: 'pointer',
                border: type === t ? '2px solid #1a56db' : '1.5px solid #e5e7eb',
                background: type === t ? '#eff6ff' : '#fff',
                fontWeight: 700, fontSize: 14,
                color: type === t ? '#1a56db' : '#6b7280'
              }}>
              {t === 'grid' ? 'Grid Meter' : 'Solar PAYG Kit'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Vendor field */}
          <label style={labelStyle}>Energy Vendor</label>

          {vendorsLoading ? (
            <div style={{ ...inputStyle, color: '#9ca3af', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
              Loading vendors...
            </div>
          ) : vendorError ? (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#991b1b' }}>
              Failed to load vendors: {vendorError}
              <br />
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{ marginTop: 8, color: '#1a56db', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' }}>
                Retry
              </button>
            </div>
          ) : vendors.length === 0 ? (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
              No vendors found. Has a vendor registered yet?{' '}
              <Link href="/vendor/register" style={{ color: '#1a56db', fontWeight: 600, textDecoration: 'none' }}>
                Register a vendor
              </Link>
            </div>
          ) : (
            <select
              value={form.vendor_id}
              onChange={update('vendor_id')}
              required
              style={{ ...inputStyle }}>
              <option value="">Select vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.business_name}</option>
              ))}
            </select>
          )}

          {/* Device name */}
          <label style={labelStyle}>Device Name</label>
          <input
            type="text"
            placeholder={type === 'grid' ? 'e.g. Home Meter' : 'e.g. Rooftop Solar Kit'}
            value={form.device_name}
            onChange={update('device_name')}
            required
            style={inputStyle} />

          {/* Grid-specific fields */}
          {type === 'grid' ? (
            <>
              <label style={labelStyle}>Meter Number</label>
              <input type="text" placeholder="e.g. 45100012345678" value={form.meter_number} onChange={update('meter_number')} required style={inputStyle} />
              <label style={labelStyle}>Tariff (kobo per kWh)</label>
              <input type="number" value={form.tariff_kobo_per_kwh} onChange={update('tariff_kobo_per_kwh')} required style={inputStyle} />
            </>
          ) : (
            <>
              <label style={labelStyle}>Kit Serial Number</label>
              <input type="text" placeholder="e.g. SLR-2024-00123" value={form.kit_serial_number} onChange={update('kit_serial_number')} required style={inputStyle} />
              <label style={labelStyle}>Daily Rate (kobo)</label>
              <input type="number" value={form.daily_rate_kobo} onChange={update('daily_rate_kobo')} required style={inputStyle} />
            </>
          )}

          {/* State / LGA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>State</label>
              <input type="text" placeholder="Lagos" value={form.state} onChange={update('state')} style={{ ...inputStyle, marginBottom: 0 }} />
            </div>
            <div>
              <label style={labelStyle}>LGA</label>
              <input type="text" placeholder="Ikeja" value={form.lga} onChange={update('lga')} style={{ ...inputStyle, marginBottom: 0 }} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }} />

          <button
            type="submit"
            disabled={loading || vendors.length === 0 || vendorsLoading}
            style={{
              width: '100%',
              background: loading || vendors.length === 0 || vendorsLoading ? '#93c5fd' : '#1a56db',
              color: '#fff', padding: '14px', borderRadius: 12, border: 'none',
              fontSize: 15, fontWeight: 700,
              cursor: loading || vendors.length === 0 || vendorsLoading ? 'not-allowed' : 'pointer'
            }}>
            {loading ? 'Registering...' : 'Register Device'}
          </button>
        </form>
      </div>
    </main>
  );
}