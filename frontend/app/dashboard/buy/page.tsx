'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

const AMOUNTS = [
  { naira: 200, label: '₦200', kwh: '~2.4 kWh' },
  { naira: 500, label: '₦500', kwh: '~5.9 kWh' },
  { naira: 1000, label: '₦1,000', kwh: '~11.8 kWh', popular: true },
  { naira: 2000, label: '₦2,000', kwh: '~23.5 kWh' },
  { naira: 5000, label: '₦5,000', kwh: '~58.8 kWh' },
];

type Device = {
  id: string;
  device_name: string;
  device_type: string;
};

export default function BuyEnergy() {
  const router = useRouter();
  const [selected, setSelected] = useState(1000);
  const [custom, setCustom] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('alyra_token');
    if (!token) { router.push('/login'); return; }
    api.getDevices().then(res => setDevices(res.data || [])).catch(() => router.push('/login'));
  }, [router]);

  const finalAmount = custom ? parseInt(custom) * 100 : selected * 100;
  const kwhEstimate = (finalAmount / 8500).toFixed(1);
  const device = devices[0];

  const handlePay = async () => {
    if (!device) { setError('No device registered'); return; }
    if (finalAmount < 20000) { setError('Minimum purchase is ₦200'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.initiatePayment(device.id, finalAmount, 'web');
      window.location.href = res.data.payment_url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed to initiate';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#534AB7', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#EEEDFE', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>←</button>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#EEEDFE' }}>Buy Energy</div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 24px' }}>
        {device && (
          <div style={{ background: '#EEEDFE', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#534AB7' }}>
            {device.device_name} · {device.device_type} · ₦85/kWh
          </div>
        )}

        <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>Select Amount</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {AMOUNTS.map(a => (
            <div
              key={a.naira}
              onClick={() => { setSelected(a.naira); setCustom(''); }}
              style={{
                background: selected === a.naira && !custom ? '#EEEDFE' : '#fff',
                border: selected === a.naira && !custom ? '2px solid #534AB7' : '1.5px solid #e0deff',
                borderRadius: 12, padding: '14px', cursor: 'pointer', position: 'relative',
                transition: 'all 0.15s',
              }}
            >
              {a.popular && (
                <div style={{ position: 'absolute', top: -8, right: 10, background: '#534AB7', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                  POPULAR
                </div>
              )}
              <div style={{ fontSize: 16, fontWeight: 700, color: selected === a.naira && !custom ? '#534AB7' : '#222' }}>{a.label}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{a.kwh}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Or enter custom amount (₦)</div>
          <input
            type="number"
            placeholder="e.g. 3000"
            value={custom}
            onChange={e => { setCustom(e.target.value); setSelected(0); }}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0deff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ background: '#EEEDFE', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#534AB7' }}>You will receive</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#3C3489' }}>{kwhEstimate} kWh</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#534AB7' }}>Estimated duration</span>
            <span style={{ fontSize: 13, color: '#534AB7' }}>~{Math.round(Number(kwhEstimate) / 0.5)} hours</span>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 14px', color: '#c62828', fontSize: 14, marginBottom: 16 }}>{error}</div>
        )}

        <button
          onClick={handlePay}
          disabled={loading || !device}
          style={{ width: '100%', background: loading ? '#9990d4' : '#534AB7', color: '#fff', padding: '16px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Redirecting to payment...' : `Pay ₦${custom || (selected).toLocaleString()} via Interswitch →`}
        </button>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#888' }}>
          Secured by Interswitch. Your payment is encrypted.
        </div>
      </div>
    </main>
  );
}