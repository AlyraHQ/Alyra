// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import NavBar from "@/components/NavBar";
// import AlertBanner from "@/components/AlertBanner";
// import { getMyDevices, getDevicePrediction, Device, Prediction } from "@/lib/api";

// export default function DashboardPage() {
//   const router = useRouter();
//   const [devices, setDevices] = useState<Device[]>([]);
//   const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("alyra_token");
//     if (!token) { router.push("/login"); return; }

//     (async () => {
//       try {
//         const devs = await getMyDevices();
//         setDevices(devs);
//         const preds: Record<string, Prediction> = {};
//         await Promise.all(
//           devs.map(async (d) => {
//             try {
//               preds[d.id] = await getDevicePrediction(d.id);
//             } catch { /* no prediction yet */ }
//           })
//         );
//         setPredictions(preds);
//       } catch (err: unknown) {
//         setError(err instanceof Error ? err.message : "Failed to load devices.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [router]);

//   return (
//     <>
//       <NavBar />
//       <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
//         <div>
//           <h1 className="text-2xl font-bold">Dashboard</h1>
//           <p className="text-gray-400 text-sm mt-1">Your energy at a glance</p>
//         </div>

//         {loading && (
//           <div className="text-center py-16 text-gray-500">Loading your devices…</div>
//         )}

//         {error && (
//           <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">
//             {error}
//           </div>
//         )}

//         {!loading && devices.length === 0 && (
//           <div className="card text-center py-10">
//             <p className="text-gray-400 mb-4">No devices linked to your account yet.</p>
//             <p className="text-gray-600 text-sm">Contact support to add your meter or solar kit.</p>
//           </div>
//         )}

//         {devices.map((device) => (
//           <div key={device.id} className="space-y-3">
//             {/* Alert banner if prediction is low */}
//             <AlertBanner prediction={predictions[device.id] ?? null} deviceId={device.id} />

//             {/* Device card */}
//             <div className="card space-y-4">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
//                     {device.device_type === "grid_meter" ? "⚡ Grid Meter" : "☀️ Solar PAYG"}
//                   </span>
//                   <p className="font-mono text-gray-300 text-sm mt-0.5">{device.meter_number}</p>
//                 </div>
//                 <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
//                   device.is_active
//                     ? "bg-green-500/20 text-green-400"
//                     : "bg-red-500/20 text-red-400"
//                 }`}>
//                   {device.is_active ? "Active" : "Inactive"}
//                 </span>
//               </div>

//               {/* Units / Battery */}
//               {device.device_type === "grid_meter" ? (
//                 <div>
//                   <div className="flex justify-between text-sm mb-1.5">
//                     <span className="text-gray-400">Units remaining</span>
//                     <span className="font-bold text-white">{device.current_units.toFixed(1)} kWh</span>
//                   </div>
//                   <div className="w-full bg-gray-800 rounded-full h-2">
//                     <div
//                       className="bg-purple-600 h-2 rounded-full transition-all"
//                       style={{ width: `${Math.min((device.current_units / 50) * 100, 100)}%` }}
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <div>
//                   <div className="flex justify-between text-sm mb-1.5">
//                     <span className="text-gray-400">Battery level</span>
//                     <span className="font-bold text-white">{device.battery_percentage ?? 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-800 rounded-full h-2">
//                     <div
//                       className="bg-amber-400 h-2 rounded-full transition-all"
//                       style={{ width: `${device.battery_percentage ?? 0}%` }}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Prediction info */}
//               {predictions[device.id] && (
//                 <p className="text-xs text-gray-500">
//                   Predicted to last ~{predictions[device.id].predicted_depletion_hours}h ·{" "}
//                   Suggested top-up: ₦{predictions[device.id].recommended_topup_naira.toLocaleString()}
//                 </p>
//               )}

//               <Link
//                 href={`/dashboard/buy?device=${device.id}`}
//                 className="btn-primary text-center block text-sm py-2.5"
//               >
//                 Buy Energy
//               </Link>
//             </div>
//           </div>
//         ))}
//       </main>
//     </>
//   );
// }

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

type DashboardUser = {
  full_name?: string;
  phone?: string;
};

type DashboardDevice = {
  id: string;
  device_name?: string;
  units_balance: number | null;
  status?: string;
  device_type?: string;
  lga?: string;
  state?: string;
};

type DashboardTransaction = {
  id: string;
  amount_kobo: number;
  initiated_at: string;
  units_purchased?: number | null;
  status: 'success' | 'pending' | 'failed' | string;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [devices, setDevices] = useState<DashboardDevice[]>([]);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('alyra_token');
    if (!token) { router.push('/login'); return; }

    Promise.all([api.me(), api.getDevices(), api.getTransactions()])
      .then(([userRes, devRes, txnRes]) => {
        setUser(userRes.data);
        setDevices(devRes.data || []);
        setTransactions(txnRes.data || []);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.removeItem('alyra_token');
    router.push('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ color: '#534AB7', fontSize: 16 }}>Loading Alyra...</div>
    </div>
  );

  const device = devices[0];
  const lowBalance = device && device.units_balance !== null && device.units_balance < 10;

  return (
    <main style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#534AB7', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 500, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 12, color: '#AFA9EC' }}>Good day,</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#EEEDFE' }}>{user?.full_name || user?.phone}</div>
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#EEEDFE', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 24px' }}>

        {/* Low balance alert */}
        {lowBalance && (
          <div style={{ background: '#fff8e1', border: '1px solid #ffcc02', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#856404' }}>⚠ Low Energy Alert</div>
              <div style={{ fontSize: 12, color: '#997a00', marginTop: 2 }}>
                Only {device.units_balance?.toFixed(1)} kWh left — predicted to run out soon
              </div>
              <div style={{ fontSize: 12, color: '#997a00' }}>Recommended top-up: ₦500</div>
            </div>
            <Link href="/dashboard/buy" style={{ background: '#534AB7', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Buy Now
            </Link>
          </div>
        )}

        {/* Device card */}
        {device ? (
          <div style={{ background: '#534AB7', borderRadius: 16, padding: '20px', marginBottom: 16, color: '#EEEDFE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#AFA9EC' }}>{device.device_name}</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{device.units_balance?.toFixed(1) ?? '0.0'} <span style={{ fontSize: 14, fontWeight: 400 }}>kWh</span></div>
              </div>
              <div style={{ background: '#3C3489', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: '#9FE1CB' }}>
                {device.status}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, height: 6, marginBottom: 8 }}>
              <div style={{ background: '#AFA9EC', height: '100%', borderRadius: 4, width: `${Math.min(((device.units_balance || 0) / 50) * 100, 100)}%` }} />
            </div>
            <div style={{ fontSize: 11, color: '#AFA9EC' }}>{device.device_type} · {device.lga}, {device.state}</div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '2px dashed #e0deff', borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ color: '#534AB7', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>No device registered</div>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Register your meter or solar kit to get started</div>
            <Link href="/dashboard/register-device" style={{ background: '#534AB7', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Register Device
            </Link>
          </div>
        )}

        {/* Buy button */}
        <Link href="/dashboard/buy" style={{
          display: 'block', background: '#534AB7', color: '#fff', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: 16, textAlign: 'center', textDecoration: 'none', marginBottom: 20
        }}>
          ⚡ Buy Energy Tokens
        </Link>

        {/* Transactions */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>Recent Transactions</div>
          {transactions.length === 0 ? (
            <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No transactions yet</div>
          ) : (
            transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#222' }}>₦{(txn.amount_kobo / 100).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{new Date(txn.initiated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#3B6D11' }}>+{txn.units_purchased?.toFixed(1)} kWh</div>
                  <div style={{ fontSize: 11, background: txn.status === 'success' ? '#EAF3DE' : '#fff0f0', color: txn.status === 'success' ? '#3B6D11' : '#c62828', padding: '2px 8px', borderRadius: 4 }}>
                    {txn.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}