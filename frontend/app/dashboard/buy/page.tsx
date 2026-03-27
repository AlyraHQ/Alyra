'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { api } from '../../../lib/api';

type Device = { id: string; device_name: string; device_type: string };

const PRESETS = [
  { naira: 100, label: '₦100', est: '~1.2 kWh' },
  { naira: 200, label: '₦200', est: '~2.4 kWh' },
  { naira: 500, label: '₦500', est: '~5.9 kWh' },
  { naira: 1000, label: '₦1,000', est: '~11.8 kWh', popular: true },
  { naira: 2000, label: '₦2,000', est: '~23.5 kWh' },
  { naira: 5000, label: '₦5,000', est: '~58.8 kWh' },
];

function BuyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const deviceIdParam = params.get('device');

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(deviceIdParam || '');
  const [selected, setSelected] = useState(500);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('alyra_token')) { router.push('/login'); return; }
    api.getDevices().then(data => {
      const devs = Array.isArray(data) ? data : [];
      setDevices(devs);
      if (!selectedDevice && devs.length > 0) setSelectedDevice(devs[0].id);
    }).catch(() => router.push('/login'));
  }, [router, selectedDevice]);

  const finalNaira = custom ? Math.max(parseInt(custom) || 0, 0) : selected;
  const finalKobo = finalNaira * 100;
  const kwhEst = (finalKobo / 8500).toFixed(2);

  const handlePay = async () => {
    if (!selectedDevice) { setError('Please select a device'); return; }
    if (finalKobo < 10000) { setError('Minimum top-up is ₦100'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.initiatePayment(selectedDevice, finalKobo, 'web');
      window.location.href = data.payment_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not initiate payment');
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: 14, cursor: 'pointer', color: '#374151' }}>Back</button>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Buy Energy Tokens</span>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

        {/* Device selector */}
        {devices.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Device</label>
            <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' as const }}>
              {devices.map(d => <option key={d.id} value={d.id}>{d.device_name} ({d.device_type})</option>)}
            </select>
          </div>
        )}

        {devices.length === 1 && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '11px 14px', marginBottom: 20, fontSize: 13, color: '#1e40af', fontWeight: 500 }}>
            {devices[0].device_name} · {devices[0].device_type === 'grid' ? 'Grid Meter' : 'Solar PAYG'}
          </div>
        )}

        {/* Amount selection */}
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 12 }}>Select amount</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {PRESETS.map(p => {
            const sel = selected === p.naira && !custom;
            return (
              <div key={p.naira} onClick={() => { setSelected(p.naira); setCustom(''); }}
                style={{ background: sel ? '#eff6ff' : '#fff', border: sel ? '2px solid #1a56db' : '1.5px solid #e5e7eb', borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center', position: 'relative' as const }}>
                {p.popular && (
                  <div style={{ position: 'absolute' as const, top: -8, left: '50%', transform: 'translateX(-50%)', background: '#16a34a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' as const }}>
                    POPULAR
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 16, color: sel ? '#1a56db' : '#111827' }}>{p.label}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{p.est}</div>
              </div>
            );
          })}
        </div>

        {/* Custom amount */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Or enter amount (₦)</label>
          <input type="number" placeholder="Any amount from ₦100" value={custom}
            onChange={e => { setCustom(e.target.value); setSelected(0); }}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const }} />
        </div>

        {/* Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>You will receive</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>{kwhEst} kWh</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Estimated duration</span>
            <span style={{ fontSize: 14, color: '#374151' }}>~{Math.round(Number(kwhEst) / 0.5)} hours</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>₦{finalNaira.toLocaleString()}</span>
          </div>
        </div>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 14, marginBottom: 16 }}>{error}</div>}

        <button onClick={handlePay} disabled={loading || !selectedDevice}
          style={{ width: '100%', background: loading || !selectedDevice ? '#93c5fd' : '#1a56db', color: '#fff', padding: '15px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading || !selectedDevice ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Redirecting to payment...' : `Pay ₦${finalNaira.toLocaleString()} via Interswitch`}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
          Secured by Interswitch. Card, USSD, and bank transfer accepted.
        </p>
      </div>
    </main>
  );
}

export default function BuyPage() {
  return <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>}><BuyContent /></Suspense>;
}