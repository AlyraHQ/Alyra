// frontend/app/dashboard/register-device/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deviceAPI, vendorAPI, authAPI } from '../../../lib/api';

type Vendor = { id: string; business_name: string; owner_name: string; phone: string };

export default function RegisterDevice() {
  const router = useRouter();
  const [deviceType, setDeviceType] = useState<'grid' | 'solar'>('grid');
  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [hasVendor, setHasVendor] = useState(false);
  const [linkingVendor, setLinkingVendor] = useState(false);

  const [grid, setGrid] = useState({ device_name: '', meter_number: '', tariff_kobo_per_kwh: 8500, state: '', lga: '' });
  const [solar, setSolar] = useState({ device_name: '', kit_serial_number: '', daily_rate_kobo: 20000, state: '', lga: '' });

  useEffect(() => {
    async function init() {
      try {
        const [user, vendorList] = await Promise.all([authAPI.me(), vendorAPI.list()]);
        setHasVendor(!!user.vendor_id);
        setVendors(vendorList || []);
        if (vendorList?.length > 0) setSelectedVendor(vendorList[0].id);
      } catch { /* ignore */ }
      finally { setLoadingVendors(false); }
    }
    init();
  }, []);

  const linkVendor = async () => {
    if (!selectedVendor) return;
    setLinkingVendor(true); setError('');
    try {
      await authAPI.selectVendor(selectedVendor);
      setHasVendor(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select vendor');
    } finally { setLinkingVendor(false); }
  };

  const registerDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasVendor) { setError('Please select your energy provider first'); return; }
    setLoading(true); setError('');
    try {
      if (deviceType === 'grid') {
        await deviceAPI.registerGrid(grid);
      } else {
        await deviceAPI.registerSolar(solar);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Device registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100dvh', padding: '0 16px 40px', maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ padding: '20px 0 4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-secondary)', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>Register Device</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Add your meter or solar kit</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ margin: '16px 0' }}>{error}</div>}

      {/* Step 1: Vendor selection */}
      {!loadingVendors && (
        <div className="card" style={{ marginTop: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Energy provider</div>
            {hasVendor && <span className="badge badge-green">Linked</span>}
          </div>

          {hasVendor ? (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Your account is linked to an energy provider. You can now register a device.
            </p>
          ) : vendors.length === 0 ? (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                No vendors registered yet. Ask your energy provider to register on Alyra, or register one below.
              </p>
              <Link href="/register-vendor" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ fontSize: '13px', padding: '10px' }}>Register as a vendor</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label>Select your energy provider</label>
                <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.business_name} — {v.phone}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={linkVendor} disabled={linkingVendor || !selectedVendor}>
                {linkingVendor ? <><div className="spinner" /><span>Linking...</span></> : 'Link to this provider'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Device form */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Device details</div>

        {/* Type toggle */}
        <div style={{ marginBottom: '18px' }}>
          <label>Device type</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setDeviceType('grid')}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${deviceType === 'grid' ? 'var(--purple-500)' : 'var(--border)'}`, background: deviceType === 'grid' ? 'rgba(124,58,237,0.1)' : 'var(--surface-2)', color: deviceType === 'grid' ? 'var(--purple-300)' : 'var(--text-muted)', fontFamily: 'inherit', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' }}>
              Grid Meter
            </button>
            <button
              type="button"
              onClick={() => setDeviceType('solar')}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${deviceType === 'solar' ? 'var(--purple-500)' : 'var(--border)'}`, background: deviceType === 'solar' ? 'rgba(124,58,237,0.1)' : 'var(--surface-2)', color: deviceType === 'solar' ? 'var(--purple-300)' : 'var(--text-muted)', fontFamily: 'inherit', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' }}>
              Solar Kit
            </button>
          </div>
        </div>

        <form onSubmit={registerDevice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label>Device name</label>
            <input type="text" placeholder={deviceType === 'grid' ? 'e.g. Living Room Meter' : 'e.g. Rooftop Solar Kit'}
              value={deviceType === 'grid' ? grid.device_name : solar.device_name}
              onChange={e => deviceType === 'grid' ? setGrid({ ...grid, device_name: e.target.value }) : setSolar({ ...solar, device_name: e.target.value })}
              required />
          </div>

          {deviceType === 'grid' ? (
            <div>
              <label>Meter number</label>
              <input type="text" placeholder="e.g. 45120938271"
                value={grid.meter_number}
                onChange={e => setGrid({ ...grid, meter_number: e.target.value })}
                required />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Found on the front of your prepaid meter</p>
            </div>
          ) : (
            <div>
              <label>Kit serial number</label>
              <input type="text" placeholder="e.g. SLR-29481-NG"
                value={solar.kit_serial_number}
                onChange={e => setSolar({ ...solar, kit_serial_number: e.target.value })}
                required />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Found on the label of your solar unit</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>State</label>
              <input type="text" placeholder="e.g. Lagos"
                value={deviceType === 'grid' ? grid.state : solar.state}
                onChange={e => deviceType === 'grid' ? setGrid({ ...grid, state: e.target.value }) : setSolar({ ...solar, state: e.target.value })} />
            </div>
            <div>
              <label>LGA</label>
              <input type="text" placeholder="e.g. Ikeja"
                value={deviceType === 'grid' ? grid.lga : solar.lga}
                onChange={e => deviceType === 'grid' ? setGrid({ ...grid, lga: e.target.value }) : setSolar({ ...solar, lga: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading || !hasVendor} style={{ marginTop: '4px' }}>
            {loading ? <><div className="spinner" /><span>Registering...</span></> : 'Register device'}
          </button>
          {!hasVendor && <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-4px' }}>Link to an energy provider above first</p>}
        </form>
      </div>
    </div>
  );
}