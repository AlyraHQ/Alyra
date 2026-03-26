// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { api } from '../../../lib/api';

// export default function RegisterDevice() {
//   const router = useRouter();
//   const [form, setForm] = useState({ device_name: '', meter_number: '', tariff_kobo_per_kwh: '8500', state: '', lga: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!localStorage.getItem('alyra_token')) router.push('/login');
//   }, [router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       await api.registerGridMeter({
//         device_name: form.device_name,
//         meter_number: form.meter_number,
//         tariff_kobo_per_kwh: parseInt(form.tariff_kobo_per_kwh),
//         state: form.state || undefined,
//         lga: form.lga || undefined,
//       });
//       router.push('/dashboard');
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Failed to register device');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
//     setForm(prev => ({ ...prev, [field]: e.target.value }));

//   const inputStyle = { width: '100%', padding: '13px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 16, fontFamily: 'inherit' };
//   const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6 } as React.CSSProperties;

//   return (
//     <main style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
//       <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
//         <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}>←</button>
//         <div style={{ fontSize: 16, fontWeight: 700 }}>Register Grid Meter</div>
//       </div>

//       <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 24px' }}>
//         {error && (
//           <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff6060', fontSize: 14, marginBottom: 16 }}>{error}</div>
//         )}

//         <form onSubmit={handleSubmit}>
//           {[
//             { label: 'Device Name', field: 'device_name', placeholder: 'My Home Meter' },
//             { label: 'Meter Number', field: 'meter_number', placeholder: 'MTR-0001234' },
//             { label: 'Tariff (kobo per kWh)', field: 'tariff_kobo_per_kwh', placeholder: '8500' },
//             { label: 'State (optional)', field: 'state', placeholder: 'Lagos' },
//             { label: 'LGA (optional)', field: 'lga', placeholder: 'Ikeja' },
//           ].map(({ label, field, placeholder }) => (
//             <div key={field}>
//               <label style={labelStyle}>{label}</label>
//               <input type="text" placeholder={placeholder}
//                 value={form[field as keyof typeof form]}
//                 onChange={update(field)} required={!['state', 'lga'].includes(field)}
//                 style={inputStyle} />
//             </div>
//           ))}

//           <button type="submit" disabled={loading}
//             style={{ width: '100%', background: loading ? '#333' : '#00ff87', color: loading ? 'rgba(255,255,255,0.3)' : '#000', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
//             {loading ? 'Registering...' : 'Register Meter →'}
//           </button>
//         </form>
//       </div>
//     </main>
//   );
// }


'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deviceAPI, vendorAPI, authAPI } from '../../../lib/api';

export default function RegisterDevice() {
  const router = useRouter();
  const [deviceType, setDeviceType] = useState<'grid'|'solar'>('grid');
  const [step, setStep] = useState<'vendor'|'device'>('device');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [vendor, setVendor] = useState({ business_name: '', owner_name: '', phone: '' });
  const [grid, setGrid] = useState({ device_name: '', meter_number: '', tariff_kobo_per_kwh: 8500, state: '', lga: '' });
  const [solar, setSolar] = useState({ device_name: '', kit_serial_number: '', daily_rate_kobo: 20000, state: '', lga: '' });

  const registerVendorFirst = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await vendorAPI.register(vendor);
      setSuccess('Vendor registered! Now register your device.');
      setStep('device');
    } catch (err) {
        if (err instanceof Error && err.message?.includes('already')) {
          setStep('device');
        } else {
          setError(err instanceof Error ? err.message : 'Vendor registration failed');
        }
    } finally { setLoading(false); }
  };

  const registerDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (deviceType === 'grid') {
        await deviceAPI.registerGrid(grid);
      } else {
        await deviceAPI.registerSolar(solar);
      }
      router.push('/dashboard');
    } catch (err) {
        if (err instanceof Error && err.message?.includes('vendor')) {
          setStep('vendor');
          setError('You need to register as a vendor first to add a device.');
        } else {
          setError(err instanceof Error ? err.message : 'Device registration failed');
        }
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen grid-bg pb-10 px-4 relative overflow-hidden">
      <div className="orb w-64 h-64" style={{ top: '-80px', right: '-60px', background: 'rgba(124,58,237,0.28)' }} />

      <div style={{ maxWidth: '420px', margin: '0 auto', position: 'relative', zIndex: 10, paddingTop: '24px' }}>
        {/* Back */}
        <Link href="/dashboard">
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontSize: '13px', marginBottom: '24px' }}>
            ← Back to dashboard
          </button>
        </Link>

        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: '24px', marginBottom: '6px' }}>Register Device</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>Add your electricity meter or solar kit</p>

        {success && <div className="ok-box" style={{ marginBottom: '16px' }}>{success}</div>}
        {error && <div className="err-box" style={{ marginBottom: '16px' }}>{error}</div>}

        {/* Vendor registration step */}
        {step === 'vendor' && (
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Step 1 — Register as Vendor</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '18px' }}>Devices must be linked to an energy vendor account.</p>
            <form onSubmit={registerVendorFirst}>
              <div style={{ marginBottom: '14px' }}>
                <label className="label">Business name</label>
                <input className="inp" placeholder="Sunshine Energy Ltd" value={vendor.business_name}
                  onChange={e => setVendor({...vendor, business_name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="label">Owner name</label>
                <input className="inp" placeholder="Emeka Obi" value={vendor.owner_name}
                  onChange={e => setVendor({...vendor, owner_name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label className="label">Vendor phone</label>
                <input className="inp" type="tel" placeholder="08012345678" value={vendor.phone}
                  onChange={e => setVendor({...vendor, phone: e.target.value})} required />
              </div>
              <button className="btn btn-purple" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Vendor →'}
              </button>
            </form>
          </div>
        )}

        {/* Device registration step */}
        {step === 'device' && (
          <div className="card" style={{ padding: '20px' }}>
            {/* Type selector */}
            <label className="label" style={{ marginBottom: '10px' }}>Device type</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {(['grid','solar'] as const).map(t => (
                <button key={t} onClick={() => setDeviceType(t)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${deviceType===t?'#7c3aed':'var(--border)'}`, background: deviceType===t?'rgba(124,58,237,0.15)':'rgba(255,255,255,0.03)', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '14px', color: deviceType===t?'#c084fc':'var(--muted)', textTransform: 'capitalize' }}>
                  {t === 'grid' ? '⚡ Grid Meter' : '☀️ Solar Kit'}
                </button>
              ))}
            </div>

            <form onSubmit={registerDevice}>
              {deviceType === 'grid' ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label className="label">Device name</label>
                    <input className="inp" placeholder="Kitchen Meter" value={grid.device_name}
                      onChange={e => setGrid({...grid, device_name: e.target.value})} required />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label className="label">Meter number</label>
                    <input className="inp" placeholder="45120938271" value={grid.meter_number}
                      onChange={e => setGrid({...grid, meter_number: e.target.value})} required />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label className="label">State</label>
                    <input className="inp" placeholder="Lagos" value={grid.state}
                      onChange={e => setGrid({...grid, state: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label className="label">LGA</label>
                    <input className="inp" placeholder="Ikeja" value={grid.lga}
                      onChange={e => setGrid({...grid, lga: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label className="label">Device name</label>
                    <input className="inp" placeholder="Home Solar Kit" value={solar.device_name}
                      onChange={e => setSolar({...solar, device_name: e.target.value})} required />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label className="label">Kit serial number</label>
                    <input className="inp" placeholder="SLR-29481-NG" value={solar.kit_serial_number}
                      onChange={e => setSolar({...solar, kit_serial_number: e.target.value})} required />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label className="label">State</label>
                    <input className="inp" placeholder="Kano" value={solar.state}
                      onChange={e => setSolar({...solar, state: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label className="label">LGA</label>
                    <input className="inp" placeholder="Nassarawa" value={solar.lga}
                      onChange={e => setSolar({...solar, lga: e.target.value})} />
                  </div>
                </>
              )}
              <button className="btn btn-purple" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Device'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}