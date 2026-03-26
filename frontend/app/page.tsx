// 'use client';
// import Link from 'next/link';

// export default function Home() {
//   return (
//     <main style={{
//       minHeight: '100vh',
//       background: '#534AB7',
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '24px',
//       fontFamily: 'system-ui, sans-serif',
//     }}>
//       <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
//         <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
//         <h1 style={{ fontSize: 36, fontWeight: 700, color: '#EEEDFE', margin: '0 0 8px' }}>
//           Alyra
//         </h1>
//         <p style={{ color: '#AFA9EC', fontSize: 16, marginBottom: 8 }}>
//           Smart Energy Platform
//         </p>
//         <p style={{ color: '#EEEDFE', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
//           Power your home with solar energy. Buy tokens instantly from any phone no smartphone needed.
//         </p>

//         <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
//           <Link href="/register" style={{
//             background: '#fff',
//             color: '#534AB7',
//             padding: '14px 24px',
//             borderRadius: 12,
//             fontWeight: 600,
//             fontSize: 16,
//             textDecoration: 'none',
//             display: 'block',
//           }}>
//             Get Started
//           </Link>
//           <Link href="/login" style={{
//             border: '2px solid #AFA9EC',
//             color: '#EEEDFE',
//             padding: '13px 24px',
//             borderRadius: 12,
//             fontWeight: 600,
//             fontSize: 16,
//             textDecoration: 'none',
//             display: 'block',
//           }}>
//             Sign In
//           </Link>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 48 }}>
//           {[['80M+', 'Off-grid Nigerians'], ['60s', 'Token delivery'], ['92%', 'Cheaper than gen']].map(([val, label]) => (
//             <div key={label} style={{ textAlign: 'center' }}>
//               <div style={{ fontSize: 20, fontWeight: 700, color: '#EEEDFE' }}>{val}</div>
//               <div style={{ fontSize: 11, color: '#AFA9EC' }}>{label}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </main>
//   );
// }


'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Trigger the entrance transition after the first paint to avoid
    // synchronously cascading state updates during the effect.
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <main className="min-h-screen grid-bg relative overflow-hidden">
      <div className="orb w-96 h-96" style={{ top: '-120px', left: '-120px', background: 'rgba(124,58,237,0.38)' }} />
      <div className="orb w-64 h-64" style={{ bottom: '60px', right: '-60px', background: 'rgba(168,85,247,0.28)', animationDelay: '4s' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '17px' }}>Alyra</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login"><button className="btn btn-outline" style={{ width: 'auto', padding: '9px 18px', fontSize: '13px' }}>Sign in</button></Link>
          <Link href="/register"><button className="btn btn-purple" style={{ width: 'auto', padding: '9px 18px', fontSize: '13px' }}>Get started</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pt-16 pb-24">
        <div style={{ opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
          <div className="badge badge-purple mb-5 inline-flex">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', animation: 'pulse-orb 2s infinite' }} />
            Powering off-grid Nigeria
          </div>

          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(40px,8vw,72px)', fontWeight: 900, lineHeight: 1.05, marginBottom: '20px' }}>
            Energy tokens,{' '}
            <span style={{ color: '#a855f7', textShadow: '0 0 30px rgba(168,85,247,0.5)' }}>instantly.</span>
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: '18px', maxWidth: '500px', lineHeight: '1.7', marginBottom: '36px' }}>
            Buy prepaid electricity and solar energy tokens in seconds. Works on smartphones and feature phones across Nigeria.
          </p>

          <div className="flex flex-col sm:flex-row gap-3" style={{ maxWidth: '400px' }}>
            <Link href="/register" style={{ flex: 1 }}>
              <button className="btn btn-purple" style={{ padding: '15px', fontSize: '15px' }}>Start buying energy →</button>
            </Link>
            <Link href="/login" style={{ flex: 1 }}>
              <button className="btn btn-outline" style={{ padding: '15px', fontSize: '15px' }}>Sign in</button>
            </Link>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 mt-20" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))' }}>
          {[
            { icon: '⚡', title: 'Grid Meters', desc: 'Top up prepaid electricity meters. Get a 20-digit STS token via SMS.', d: 'd1' },
            { icon: '☀️', title: 'Solar PAYG', desc: 'Pay-as-you-go solar kits. Unlock daily access with one payment.', d: 'd2' },
            { icon: '📱', title: 'USSD Support', desc: 'No internet needed. Dial to buy tokens from any feature phone.', d: 'd3' },
          ].map(c => (
            <div key={c.title} className={`card p-6 fade-up ${c.d}`}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{c.icon}</div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, marginBottom: '8px' }}>{c.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="divider" style={{ margin: '60px 0' }} />

        <div className="grid grid-cols-3 gap-6 text-center">
          {[['₦0','Setup fee'],['20s','Token delivery'],['24/7','Available']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, color: '#a855f7', textShadow: '0 0 24px rgba(168,85,247,0.4)' }}>{v}</div>
              <div style={{ color: 'var(--dim)', fontSize: '13px', marginTop: '4px' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}