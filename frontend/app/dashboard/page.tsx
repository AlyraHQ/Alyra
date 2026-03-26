// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import Link from "next/link";
// // import NavBar from "@/components/NavBar";
// // import AlertBanner from "@/components/AlertBanner";
// // import { getMyDevices, getDevicePrediction, Device, Prediction } from "@/lib/api";

// // export default function DashboardPage() {
// //   const router = useRouter();
// //   const [devices, setDevices] = useState<Device[]>([]);
// //   const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");

// //   useEffect(() => {
// //     const token = localStorage.getItem("alyra_token");
// //     if (!token) { router.push("/login"); return; }

// //     (async () => {
// //       try {
// //         const devs = await getMyDevices();
// //         setDevices(devs);
// //         const preds: Record<string, Prediction> = {};
// //         await Promise.all(
// //           devs.map(async (d) => {
// //             try {
// //               preds[d.id] = await getDevicePrediction(d.id);
// //             } catch { /* no prediction yet */ }
// //           })
// //         );
// //         setPredictions(preds);
// //       } catch (err: unknown) {
// //         setError(err instanceof Error ? err.message : "Failed to load devices.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     })();
// //   }, [router]);

// //   return (
// //     <>
// //       <NavBar />
// //       <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
// //         <div>
// //           <h1 className="text-2xl font-bold">Dashboard</h1>
// //           <p className="text-gray-400 text-sm mt-1">Your energy at a glance</p>
// //         </div>

// //         {loading && (
// //           <div className="text-center py-16 text-gray-500">Loading your devices…</div>
// //         )}

// //         {error && (
// //           <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">
// //             {error}
// //           </div>
// //         )}

// //         {!loading && devices.length === 0 && (
// //           <div className="card text-center py-10">
// //             <p className="text-gray-400 mb-4">No devices linked to your account yet.</p>
// //             <p className="text-gray-600 text-sm">Contact support to add your meter or solar kit.</p>
// //           </div>
// //         )}

// //         {devices.map((device) => (
// //           <div key={device.id} className="space-y-3">
// //             {/* Alert banner if prediction is low */}
// //             <AlertBanner prediction={predictions[device.id] ?? null} deviceId={device.id} />

// //             {/* Device card */}
// //             <div className="card space-y-4">
// //               <div className="flex items-start justify-between">
// //                 <div>
// //                   <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
// //                     {device.device_type === "grid_meter" ? "⚡ Grid Meter" : "☀️ Solar PAYG"}
// //                   </span>
// //                   <p className="font-mono text-gray-300 text-sm mt-0.5">{device.meter_number}</p>
// //                 </div>
// //                 <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
// //                   device.is_active
// //                     ? "bg-green-500/20 text-green-400"
// //                     : "bg-red-500/20 text-red-400"
// //                 }`}>
// //                   {device.is_active ? "Active" : "Inactive"}
// //                 </span>
// //               </div>

// //               {/* Units / Battery */}
// //               {device.device_type === "grid_meter" ? (
// //                 <div>
// //                   <div className="flex justify-between text-sm mb-1.5">
// //                     <span className="text-gray-400">Units remaining</span>
// //                     <span className="font-bold text-white">{device.current_units.toFixed(1)} kWh</span>
// //                   </div>
// //                   <div className="w-full bg-gray-800 rounded-full h-2">
// //                     <div
// //                       className="bg-purple-600 h-2 rounded-full transition-all"
// //                       style={{ width: `${Math.min((device.current_units / 50) * 100, 100)}%` }}
// //                     />
// //                   </div>
// //                 </div>
// //               ) : (
// //                 <div>
// //                   <div className="flex justify-between text-sm mb-1.5">
// //                     <span className="text-gray-400">Battery level</span>
// //                     <span className="font-bold text-white">{device.battery_percentage ?? 0}%</span>
// //                   </div>
// //                   <div className="w-full bg-gray-800 rounded-full h-2">
// //                     <div
// //                       className="bg-amber-400 h-2 rounded-full transition-all"
// //                       style={{ width: `${device.battery_percentage ?? 0}%` }}
// //                     />
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Prediction info */}
// //               {predictions[device.id] && (
// //                 <p className="text-xs text-gray-500">
// //                   Predicted to last ~{predictions[device.id].predicted_depletion_hours}h ·{" "}
// //                   Suggested top-up: ₦{predictions[device.id].recommended_topup_naira.toLocaleString()}
// //                 </p>
// //               )}

// //               <Link
// //                 href={`/dashboard/buy?device=${device.id}`}
// //                 className="btn-primary text-center block text-sm py-2.5"
// //               >
// //                 Buy Energy
// //               </Link>
// //             </div>
// //           </div>
// //         ))}
// //       </main>
// //     </>
// //   );
// // }

// 'use client';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { api } from '../../lib/api';

// type DashboardUser = {
//   full_name?: string;
//   phone?: string;
// };

// type DashboardDevice = {
//   id: string;
//   device_name?: string;
//   units_balance: number | null;
//   status?: string;
//   device_type?: string;
//   lga?: string;
//   state?: string;
// };

// type DashboardTransaction = {
//   id: string;
//   amount_kobo: number;
//   initiated_at: string;
//   units_purchased?: number | null;
//   status: 'success' | 'pending' | 'failed' | string;
// };

// export default function Dashboard() {
//   const router = useRouter();
//   const [user, setUser] = useState<DashboardUser | null>(null);
//   const [devices, setDevices] = useState<DashboardDevice[]>([]);
//   const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('alyra_token');
//     if (!token) { router.push('/login'); return; }

//     Promise.all([api.me(), api.getDevices(), api.getTransactions()])
//       .then(([userRes, devRes, txnRes]) => {
//         setUser(userRes.data);
//         setDevices(devRes.data || []);
//         setTransactions(txnRes.data || []);
//       })
//       .catch(() => router.push('/login'))
//       .finally(() => setLoading(false));
//   }, [router]);

//   const logout = () => {
//     localStorage.removeItem('alyra_token');
//     router.push('/login');
//   };

//   if (loading) return (
//     <div style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
//       <div style={{ color: '#534AB7', fontSize: 16 }}>Loading Alyra...</div>
//     </div>
//   );

//   const device = devices[0];
//   const lowBalance = device && device.units_balance !== null && device.units_balance < 10;

//   return (
//     <main style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, sans-serif' }}>
//       {/* Header */}
//       <div style={{ background: '#534AB7', padding: '20px 24px' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 500, margin: '0 auto' }}>
//           <div>
//             <div style={{ fontSize: 12, color: '#AFA9EC' }}>Good day,</div>
//             <div style={{ fontSize: 18, fontWeight: 700, color: '#EEEDFE' }}>{user?.full_name || user?.phone}</div>
//           </div>
//           <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#EEEDFE', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
//             Logout
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 24px' }}>

//         {/* Low balance alert */}
//         {lowBalance && (
//           <div style={{ background: '#fff8e1', border: '1px solid #ffcc02', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <div>
//               <div style={{ fontSize: 13, fontWeight: 600, color: '#856404' }}>⚠ Low Energy Alert</div>
//               <div style={{ fontSize: 12, color: '#997a00', marginTop: 2 }}>
//                 Only {device.units_balance?.toFixed(1)} kWh left — predicted to run out soon
//               </div>
//               <div style={{ fontSize: 12, color: '#997a00' }}>Recommended top-up: ₦500</div>
//             </div>
//             <Link href="/dashboard/buy" style={{ background: '#534AB7', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
//               Buy Now
//             </Link>
//           </div>
//         )}

//         {/* Device card */}
//         {device ? (
//           <div style={{ background: '#534AB7', borderRadius: 16, padding: '20px', marginBottom: 16, color: '#EEEDFE' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
//               <div>
//                 <div style={{ fontSize: 12, color: '#AFA9EC' }}>{device.device_name}</div>
//                 <div style={{ fontSize: 28, fontWeight: 700 }}>{device.units_balance?.toFixed(1) ?? '0.0'} <span style={{ fontSize: 14, fontWeight: 400 }}>kWh</span></div>
//               </div>
//               <div style={{ background: '#3C3489', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: '#9FE1CB' }}>
//                 {device.status}
//               </div>
//             </div>
//             <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, height: 6, marginBottom: 8 }}>
//               <div style={{ background: '#AFA9EC', height: '100%', borderRadius: 4, width: `${Math.min(((device.units_balance || 0) / 50) * 100, 100)}%` }} />
//             </div>
//             <div style={{ fontSize: 11, color: '#AFA9EC' }}>{device.device_type} · {device.lga}, {device.state}</div>
//           </div>
//         ) : (
//           <div style={{ background: '#fff', border: '2px dashed #e0deff', borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 16 }}>
//             <div style={{ color: '#534AB7', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>No device registered</div>
//             <div style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Register your meter or solar kit to get started</div>
//             <Link href="/dashboard/register-device" style={{ background: '#534AB7', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
//               Register Device
//             </Link>
//           </div>
//         )}

//         {/* Buy button */}
//         <Link href="/dashboard/buy" style={{
//           display: 'block', background: '#534AB7', color: '#fff', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: 16, textAlign: 'center', textDecoration: 'none', marginBottom: 20
//         }}>
//           ⚡ Buy Energy Tokens
//         </Link>

//         {/* Transactions */}
//         <div>
//           <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>Recent Transactions</div>
//           {transactions.length === 0 ? (
//             <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No transactions yet</div>
//           ) : (
//             transactions.slice(0, 5).map((txn) => (
//               <div key={txn.id} style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div>
//                   <div style={{ fontSize: 14, fontWeight: 500, color: '#222' }}>₦{(txn.amount_kobo / 100).toLocaleString()}</div>
//                   <div style={{ fontSize: 11, color: '#888' }}>{new Date(txn.initiated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
//                 </div>
//                 <div style={{ textAlign: 'right' }}>
//                   <div style={{ fontSize: 13, fontWeight: 600, color: '#3B6D11' }}>+{txn.units_purchased?.toFixed(1)} kWh</div>
//                   <div style={{ fontSize: 11, background: txn.status === 'success' ? '#EAF3DE' : '#fff0f0', color: txn.status === 'success' ? '#3B6D11' : '#c62828', padding: '2px 8px', borderRadius: 4 }}>
//                     {txn.status}
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }

// frontend/app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, deviceAPI, paymentAPI } from '../../lib/api';

type User = { id: string; phone: string; full_name?: string; vendor_id?: string };
type Device = { id: string; device_name: string; device_type: string; status: string };
type Txn = { id: string; amount_kobo: number; units_purchased: number; channel: string; status: string; initiated_at: string };

const AMOUNTS = [
  { label: '₦200', kobo: 20000 },
  { label: '₦500', kobo: 50000 },
  { label: '₦1,000', kobo: 100000 },
  { label: '₦2,000', kobo: 200000 },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'buy'|'history'|'devices'>('buy');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [token, setToken] = useState<{ token_code: string; units: string } | null>(null);
  const [payErr, setPayErr] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('access_token')) { router.push('/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const [u, d, t] = await Promise.all([authAPI.me(), deviceAPI.list(), paymentAPI.transactions()]);
      setUser(u);
      setDevices(d || []);
      setTxns(t || []);
      if (d?.length > 0) setSelectedDevice(d[0].id);
    } catch { router.push('/login'); }
    finally { setLoading(false); }
  };

  // const buyEnergy = async () => {
  //   if (!selectedDevice || !selectedAmount) return;
  //   setPaying(true); setPayErr(''); setToken(null);
  //   try {
  //     const init = await paymentAPI.initiate({ device_id: selectedDevice, amount_kobo: selectedAmount, channel: 'web' });
  //     const confirmed = await paymentAPI.testConfirm(init.reference);
  //     setToken(confirmed);
  //     load();
  //   } catch (err) {
  //     if (err instanceof Error && err.message?.includes('')) {
  //       setStep
  //     }
  //     setPayErr(err.message || 'Payment failed. Try again.');
  //   } finally { setPaying(false); }
  // };
  const buyEnergy = async () => {
    if (!selectedDevice || !selectedAmount) return;
    setPaying(true); 
    setPayErr(''); 
    setToken(null);
    
    try {
      const init = await paymentAPI.initiate({ 
        device_id: selectedDevice, 
        amount_kobo: selectedAmount, 
        channel: 'web' 
      });
      const confirmed = await paymentAPI.testConfirm(init.reference);
      setToken(confirmed);
      load();
    } catch (err) {
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('insufficient balance')) {
          setPayErr('Insufficient balance. Please fund your wallet.');
        } else if (err.message.includes('device inactive')) {
          setPayErr('Device is inactive. Please contact support.');
        } else {
          setPayErr(err.message || 'Payment failed. Try again.');
        }
      } else {
        setPayErr('An unexpected error occurred. Please try again.');
      }
    } finally { 
      setPaying(false); 
    }
  };
  
  const logout = () => { localStorage.removeItem('access_token'); router.push('/'); };

  if (loading) return (
    <main className="min-h-screen grid-bg flex items-center justify-center">
      <div style={{ textAlign: 'center' }}>
        <svg className="spin" width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px' }}>
          <circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="3" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8" stroke="#7c3aed" strokeWidth="3" fill="none"/>
        </svg>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen grid-bg pb-24 relative overflow-hidden">
      <div className="orb w-72 h-72" style={{ top: '-80px', right: '-80px', background: 'rgba(124,58,237,0.22)' }} />

      {/* Header */}
      <header style={{ padding: '24px 16px 12px', maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontSize: '11px', fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
            </p>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: '20px' }}>
              {user?.full_name?.split(' ')[0] || user?.phone} 👋
            </h1>
          </div>
          <button onClick={logout} style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px' }}>

        {/* No vendor warning */}
        {user && !user.vendor_id && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚠️</span>
            <div>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '13px', color: '#fbbf24' }}>Account not linked to a vendor</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Register as a vendor or ask your energy provider to link your account.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', padding: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '14px', marginBottom: '16px' }}>
          {([['buy','⚡ Buy'],['devices','🔌 Devices'],['history','📋 History']] as const).map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex: 1, padding: '10px 6px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s',
                background: tab === id ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'transparent',
                color: tab === id ? '#fff' : 'var(--muted)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* BUY TAB */}
        {tab === 'buy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {devices.length === 0 ? (
              <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔌</div>
                <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, marginBottom: '6px' }}>No devices yet</p>
                <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>Register your meter or solar kit to start buying energy.</p>
                <button className="btn btn-purple" onClick={() => setTab('devices')} style={{ maxWidth: '200px', margin: '0 auto', padding: '11px' }}>Register a device</button>
              </div>
            ) : (
              <>
                {/* Device picker */}
                <div className="card" style={{ padding: '18px' }}>
                  <label className="label">Select device</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {devices.map(d => (
                      <button key={d.id} onClick={() => setSelectedDevice(d.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: `1px solid ${selectedDevice === d.id ? '#7c3aed' : 'var(--border)'}`, background: selectedDevice === d.id ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                          {d.device_type === 'grid' ? '⚡' : '☀️'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '14px' }}>{d.device_name}</p>
                          <p style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'capitalize' }}>{d.device_type} meter</p>
                        </div>
                        <span className={`badge ${d.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{d.status}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount picker */}
                <div className="card" style={{ padding: '18px' }}>
                  <label className="label">Select amount</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    {AMOUNTS.map(a => (
                      <button key={a.kobo} onClick={() => setSelectedAmount(a.kobo)}
                        style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${selectedAmount === a.kobo ? '#7c3aed' : 'var(--border)'}`, background: selectedAmount === a.kobo ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '18px', color: selectedAmount === a.kobo ? '#c084fc' : 'var(--muted)', transition: 'all 0.15s' }}>
                        {a.label}
                      </button>
                    ))}
                  </div>

                  {payErr && <div className="err-box" style={{ marginBottom: '12px' }}>{payErr}</div>}

                  <button className="btn btn-purple" onClick={buyEnergy} disabled={paying || !selectedDevice || !selectedAmount}>
                    {paying ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
                        Processing...
                      </span>
                    ) : selectedAmount ? `Buy Energy — ${AMOUNTS.find(a=>a.kobo===selectedAmount)?.label}` : 'Select an amount'}
                  </button>
                </div>

                {/* Token result */}
                {token && (
                  <div className="card-bright fade-up" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span className="badge badge-green">✓ Payment confirmed</span>
                    </div>
                    <label className="label">Your Energy Token</label>
                    <div className="token-box" style={{ marginBottom: '10px' }}>{token.token_code}</div>
                    <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>{token.units} · Enter this on your meter</p>
                    <button className="btn btn-outline" style={{ padding: '11px', fontSize: '13px' }}
                      onClick={() => navigator.clipboard?.writeText(token.token_code.replace(/ /g,''))}>
                      📋 Copy token
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* DEVICES TAB */}
        {tab === 'devices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {devices.length === 0 ? (
              <div className="card" style={{ padding: '30px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No devices registered yet.</p>
              </div>
            ) : devices.map(d => (
              <div key={d.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {d.device_type === 'grid' ? '⚡' : '☀️'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>{d.device_name}</p>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', textTransform: 'capitalize' }}>{d.device_type} meter</p>
                </div>
                <span className={`badge ${d.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{d.status}</span>
              </div>
            ))}

            <Link href="/dashboard/register-device">
              <button className="btn btn-outline" style={{ padding: '13px', fontSize: '14px' }}>+ Register new device</button>
            </Link>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {txns.length === 0 ? (
              <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
                <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, marginBottom: '6px' }}>No transactions yet</p>
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Your payment history will appear here.</p>
              </div>
            ) : txns.map(t => (
              <div key={t.id} className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: t.status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {t.status === 'success' ? '✓' : '✕'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '15px' }}>₦{(t.amount_kobo/100).toLocaleString()}</p>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '2px', textTransform: 'capitalize' }}>
                    {t.channel} · {new Date(t.initiated_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <span className={`badge ${t.status==='success'?'badge-green':t.status==='failed'?'badge-red':'badge-amber'}`}>{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="bottom-nav">
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: '480px', margin: '0 auto', padding: '0 16px' }}>
          {([['buy','⚡','Energy'],['devices','🔌','Devices'],['history','📋','History']] as const).map(([id,icon,label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 16px' }}>
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <span style={{ fontFamily: 'Syne,sans-serif', fontSize: '11px', fontWeight: 600, color: tab===id ? '#a855f7' : 'var(--dim)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}