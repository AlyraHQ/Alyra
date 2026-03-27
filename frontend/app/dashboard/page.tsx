// frontend/app/dashboard/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, deviceAPI, paymentAPI } from '../../lib/api';

type User = { id: string; phone: string; full_name?: string; vendor_id?: string };
type Device = { id: string; device_name: string; device_type: string; status: string };
type Txn = { id: string; amount_kobo: number; units_purchased: number; channel: string; status: string; initiated_at: string };
type TokenResult = { token_code: string; units: string; message: string };

const AMOUNTS = [
  { label: '₦200', kobo: 20000 },
  { label: '₦500', kobo: 50000 },
  { label: '₦1,000', kobo: 100000 },
  { label: '₦2,000', kobo: 200000 },
];

// SVG icons — no emojis
const IconBolt = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const IconList = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
  </svg>
);

const IconCpu = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'buy' | 'devices' | 'history'>('buy');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null);
  const [payError, setPayError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const [u, d, t] = await Promise.all([authAPI.me(), deviceAPI.list(), paymentAPI.transactions()]);
      setUser(u);
      const devList = d || [];
      setDevices(devList);
      setTxns(t || []);
      if (devList.length > 0 && !selectedDevice) setSelectedDevice(devList[0].id);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router, selectedDevice]);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) { router.push('/login'); return; }
    load();
  }, []);

  const buyEnergy = async () => {
    if (!selectedDevice || !selectedAmount) return;
    setPaying(true); setPayError(''); setTokenResult(null);
    try {
      const init = await paymentAPI.initiate({ device_id: selectedDevice, amount_kobo: selectedAmount, channel: 'web' });
      const confirmed = await paymentAPI.testConfirm(init.reference);
      setTokenResult(confirmed);
      load();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Payment failed. Try again.');
    } finally { setPaying(false); }
  };

  const copyToken = async () => {
    if (!tokenResult) return;
    await navigator.clipboard.writeText(tokenResult.token_code.replace(/ /g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const logout = () => { localStorage.removeItem('access_token'); router.push('/'); };

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px', borderTopColor: 'var(--purple-500)', borderColor: 'rgba(124,58,237,0.2)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your account</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div className="top-nav">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
            </div>
            <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
              {user?.full_name?.split(' ')[0] || user?.phone}
            </div>
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}>
            <IconLogout /> Sign out
          </button>
        </div>

        {/* No vendor warning */}
        {user && !user.vendor_id && (
          <div className="alert alert-warning" style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: '3px' }}>Account not linked to a vendor</div>
              <div>Go to Devices tab to register your meter and select your energy provider.</div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="tab-bar" style={{ marginBottom: '16px' }}>
          {(['buy', 'devices', 'history'] as const).map(t => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'buy' ? 'Buy Energy' : t === 'devices' ? 'Devices' : 'History'}
            </button>
          ))}
        </div>

        {/* BUY TAB */}
        {tab === 'buy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {devices.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--surface-2)', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCpu color="var(--text-muted)" />
                </div>
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>No devices registered</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Register your electricity meter or solar kit to start purchasing energy.</div>
                <button className="btn btn-primary" style={{ maxWidth: '220px', margin: '0 auto', padding: '11px' }} onClick={() => setTab('devices')}>Register a device</button>
              </div>
            ) : (
              <>
                {/* Device selector */}
                <div className="card">
                  <div className="section-header">Select device</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {devices.map(d => (
                      <button key={d.id} className={`device-item${selectedDevice === d.id ? ' selected' : ''}`} onClick={() => setSelectedDevice(d.id)}>
                        <div className="device-icon">
                          {d.device_type === 'grid'
                            ? <IconBolt color="var(--purple-400)" />
                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple-400)" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                          }
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{d.device_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '2px' }}>
                            {d.device_type === 'grid' ? 'Grid meter' : 'Solar kit'}
                          </div>
                        </div>
                        <span className={`badge ${d.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{d.status}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount selector */}
                <div className="card">
                  <div className="section-header">Amount to top up</div>
                  <div className="amount-grid" style={{ marginBottom: '16px' }}>
                    {AMOUNTS.map(a => (
                      <button key={a.kobo} className={`amount-btn${selectedAmount === a.kobo ? ' selected' : ''}`} onClick={() => setSelectedAmount(a.kobo)}>
                        {a.label}
                      </button>
                    ))}
                  </div>

                  {payError && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{payError}</div>}

                  <button className="btn btn-primary" onClick={buyEnergy} disabled={paying || !selectedDevice || !selectedAmount}>
                    {paying
                      ? <><div className="spinner" /><span>Processing payment...</span></>
                      : selectedAmount
                        ? `Pay ${AMOUNTS.find(a => a.kobo === selectedAmount)?.label}`
                        : 'Select an amount to continue'}
                  </button>
                </div>

                {/* Token result */}
                {tokenResult && (
                  <div className="card" style={{ borderColor: 'var(--border-strong)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ fontWeight: 700 }}>Payment confirmed</div>
                      <span className="badge badge-green">Successful</span>
                    </div>
                    <div className="section-header">Your energy token</div>
                    <div className="token-display" style={{ marginBottom: '10px' }}>{tokenResult.token_code}</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '14px' }}>
                      {tokenResult.units} — Enter this code on your meter
                    </p>
                    <button className="btn btn-secondary" onClick={copyToken}>
                      {copied ? 'Copied!' : 'Copy token code'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* DEVICES TAB */}
        {tab === 'devices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {devices.length > 0 && devices.map(d => (
              <div key={d.id} className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="device-icon">
                  {d.device_type === 'grid' ? <IconBolt color="var(--purple-400)" /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple-400)" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{d.device_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '2px' }}>{d.device_type === 'grid' ? 'Grid meter' : 'Solar kit'}</div>
                </div>
                <span className={`badge ${d.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{d.status}</span>
              </div>
            ))}

            <Link href="/dashboard/register-device" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary" style={{ marginTop: devices.length > 0 ? '4px' : '0' }}>
                Register new device
              </button>
            </Link>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {txns.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--surface-2)', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconList color="var(--text-muted)" />
                </div>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>No transactions yet</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Your payment history will appear here.</div>
              </div>
            ) : txns.map(t => (
              <div key={t.id} className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: t.status === 'success' ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {t.status === 'success'
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>₦{(t.amount_kobo / 100).toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>
                    {t.channel} · {new Date(t.initiated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span className={`badge ${t.status === 'success' ? 'badge-green' : t.status === 'failed' ? 'badge-red' : 'badge-amber'}`}>{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <button className={`nav-tab${tab === 'buy' ? ' active' : ''}`} onClick={() => setTab('buy')}>
            <IconBolt color={tab === 'buy' ? 'var(--purple-400)' : 'var(--text-muted)'} />
            Buy Energy
          </button>
          <button className={`nav-tab${tab === 'devices' ? ' active' : ''}`} onClick={() => setTab('devices')}>
            <IconCpu color={tab === 'devices' ? 'var(--purple-400)' : 'var(--text-muted)'} />
            Devices
          </button>
          <button className={`nav-tab${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>
            <IconList color={tab === 'history' ? 'var(--purple-400)' : 'var(--text-muted)'} />
            History
          </button>
        </div>
      </div>
    </div>
  );
}