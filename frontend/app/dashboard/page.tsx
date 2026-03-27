'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Prediction } from '../../lib/api';

type User = { id: string; full_name?: string; phone?: string; vendor_id?: string };
type Device = { id: string; device_name: string; units_balance: number | null; status: string; device_type: string; lga?: string; state?: string };
type Transaction = { id: string; amount_kobo: number; initiated_at: string; units_purchased?: number | null; status: string };


// Define error type
type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

function UsageBar({ pct, low }: { pct: number; low: boolean }) {
  return (
    <div style={{ background: '#f3f4f6', borderRadius: 6, height: 10, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', borderRadius: 6, background: low ? '#ef4444' : pct < 40 ? '#f59e0b' : '#16a34a', width: `${pct}%`, transition: 'width 0.5s' }} />
    </div>
  );
}

function AlertBanner({ prediction, deviceId }: { prediction: Prediction; deviceId: string }) {
  const hours = Math.round(prediction.hours_until_empty);
  const days = (hours / 24).toFixed(1);
  return (
    <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14, marginBottom: 4 }}>Low Energy Alert</div>
        <div style={{ color: '#b45309', fontSize: 13, lineHeight: 1.4 }}>
          Approximately {hours < 24 ? `${hours} hours` : `${days} days`} of power remaining at current usage.
          <br />Recommended top-up: <strong>₦{prediction.recommended_top_up_naira.toLocaleString()}</strong>
        </div>
      </div>
      <Link href={`/dashboard/buy?device=${deviceId}`} style={{ background: '#d97706', color: '#fff', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
        Top Up
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [userData, devData, txnData] = await Promise.all([
        api.me(), api.getDevices(), api.getTransactions()
      ]);
      setUser(userData);
      const devs: Device[] = Array.isArray(devData) ? devData : [];
      setDevices(devs);
      setTransactions(Array.isArray(txnData) ? txnData : []);
      const preds: Record<string, Prediction> = {};
      await Promise.all(devs.map(async d => {
        try {
          const p = await api.getPrediction(d.id);
          if (p) preds[d.id] = p;
        } catch {
          // not enough data yet
        }
      }));
      setPredictions(preds);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to load dashboard data:', apiError?.message || 'Unknown error');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem('alyra_token')) { 
      router.push('/login'); 
      return; 
    }
    load();
  }, [load, router]);

  const logout = () => {
    localStorage.removeItem('alyra_token');
    router.push('/login');
  };

  const dailyUsage = transactions
    .filter(t => t.status === 'success' && t.units_purchased)
    .slice(0, 7)
    .reverse()
    .map(t => ({
      date: new Date(t.initiated_at).toLocaleDateString('en-NG', { weekday: 'short' }),
      units: Number(t.units_purchased || 0),
    }));
  const maxUnits = Math.max(...dailyUsage.map(d => d.units), 1);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db', fontSize: 15 }}>
      Loading your dashboard...
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#1a56db' }}>Alyra</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#4b5563' }}>{user?.full_name || user?.phone}</span>
            <button onClick={logout} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>Log out</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>

        {devices.length === 0 && (
          <div style={{ background: '#fff', border: '2px dashed #e5e7eb', borderRadius: 16, padding: '40px 24px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: '#111827', marginBottom: 8, fontSize: 16 }}>No device linked yet</div>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Register your grid meter or solar kit to start tracking usage and buying tokens.</p>
            <Link href="/dashboard/register-device" style={{ background: '#1a56db', color: '#fff', padding: '11px 24px', borderRadius: 10, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
              Register a Device
            </Link>
          </div>
        )}

        {devices.map(device => {
          const balance = Number(device.units_balance ?? 0);
          const maxBalance = 50;
          const pct = Math.min((balance / maxBalance) * 100, 100);
          const low = balance < 10;
          const pred = predictions[device.id];

          return (
            <div key={device.id}>
              {pred && pred.needs_alert && <AlertBanner prediction={pred} deviceId={device.id} />}

              <div style={{ background: '#1a56db', borderRadius: 18, padding: '24px', marginBottom: 16, color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {device.device_type === 'grid' ? 'Grid Meter' : 'Solar PAYG'} · {device.device_name}
                    </div>
                    <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
                      {balance.toFixed(1)}
                      <span style={{ fontSize: 18, fontWeight: 500, opacity: 0.8, marginLeft: 6 }}>kWh</span>
                    </div>
                    {pred && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>
                        At current usage, lasts ~{Math.round(pred.hours_until_empty)} more hours
                      </div>
                    )}
                  </div>
                  <div style={{ background: low ? '#ef4444' : 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: low ? '#fff' : 'rgba(255,255,255,0.9)' }}>
                    {low ? 'Low' : 'Active'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, height: 8 }}>
                  <div style={{ height: '100%', borderRadius: 6, background: low ? '#ef4444' : '#6ee7b7', width: `${pct}%`, transition: 'width 0.5s' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                  <span>{device.lga}{device.state ? `, ${device.state}` : ''}</span>
                  <span>{pct.toFixed(0)}% remaining</span>
                </div>
              </div>

              <Link href={`/dashboard/buy?device=${device.id}`}
                style={{ display: 'block', background: '#16a34a', color: '#fff', padding: '15px', borderRadius: 12, fontWeight: 700, fontSize: 15, textAlign: 'center', textDecoration: 'none', marginBottom: 20 }}>
                Buy Energy Tokens
              </Link>
            </div>
          );
        })}

        {dailyUsage.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>Daily Energy Purchased</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Last {dailyUsage.length} purchases</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {dailyUsage.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', background: '#dbeafe', borderRadius: '4px 4px 0 0', height: `${(d.units / maxUnits) * 64}px`, minHeight: 4 }} />
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{d.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Recent Transactions</span>
          </div>
          {transactions.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No transactions yet</div>
          ) : (
            transactions.slice(0, 6).map(txn => (
              <div key={txn.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>₦{(txn.amount_kobo / 100).toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {new Date(txn.initiated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {txn.units_purchased != null && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>+{Number(txn.units_purchased).toFixed(1)} kWh</div>
                  )}
                  <div style={{ fontSize: 11, marginTop: 3, padding: '2px 8px', borderRadius: 4, display: 'inline-block',
                    background: txn.status === 'success' ? '#dcfce7' : txn.status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: txn.status === 'success' ? '#166534' : txn.status === 'pending' ? '#92400e' : '#991b1b',
                  }}>
                    {txn.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {devices.length === 0 && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link href="/vendor/register" style={{ color: '#1a56db', fontSize: 13, textDecoration: 'none' }}>
              Are you an energy vendor? Register your business here
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}