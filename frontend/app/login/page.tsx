// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { api } from '../../lib/api';

// export default function Login() {
//   const router = useRouter();
//   const [phone, setPhone] = useState('');
//   const [pin, setPin] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const res = await api.login(phone, pin);
//       localStorage.setItem('alyra_token', res.data.access_token);
//       router.push('/dashboard');
//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : 'Login failed';
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
//       <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(83,74,183,0.1)' }}>
//         <div style={{ textAlign: 'center', marginBottom: 28 }}>
//           <div style={{ fontSize: 32 }}>⚡</div>
//           <h1 style={{ fontSize: 24, fontWeight: 700, color: '#534AB7', margin: '8px 0 4px' }}>Welcome back</h1>
//           <p style={{ color: '#888', fontSize: 14 }}>Enter your phone and PIN</p>
//         </div>

//         {error && (
//           <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 14px', color: '#c62828', fontSize: 14, marginBottom: 16 }}>
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleLogin}>
//           <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>Phone Number</label>
//           <input
//             type="tel"
//             placeholder="+234 808 123 4567"
//             value={phone}
//             onChange={e => setPhone(e.target.value)}
//             required
//             style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0deff', fontSize: 15, marginBottom: 16, outline: 'none', boxSizing: 'border-box' }}
//           />

//           <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>4-digit PIN</label>
//           <input
//             type="password"
//             placeholder="Enter PIN"
//             value={pin}
//             onChange={e => setPin(e.target.value)}
//             maxLength={4}
//             required
//             style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0deff', fontSize: 15, marginBottom: 24, outline: 'none', boxSizing: 'border-box', letterSpacing: 8 }}
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             style={{ width: '100%', background: loading ? '#9990d4' : '#534AB7', color: '#fff', padding: '14px', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
//           >
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>

//         <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
//           No account?{' '}
//           <Link href="/register" style={{ color: '#534AB7', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
//         </p>
//       </div>
//     </main>
//   );
// }

// ////-----6788888999hjj-----////
// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { api } from '../../lib/api';

// export default function Login() {
//   const router = useRouter();
//   const [phone, setPhone] = useState('');
//   const [pin, setPin] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const data = await api.login(phone, pin);
//       localStorage.setItem('alyra_token', data.access_token);
//       // Also fetch and store user info
//       try {
//         const user = await api.me();
//         localStorage.setItem('alyra_user', JSON.stringify(user));
//       } catch { /* non-critical */ }
//       router.push('/dashboard');
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Login failed. Check your phone and PIN.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const s = {
//     main: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
//     card: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 } as React.CSSProperties,
//     label: { display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6 } as React.CSSProperties,
//     input: { width: '100%', padding: '13px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 16, fontFamily: 'inherit' },
//     btn: { width: '100%', background: loading ? '#555' : '#00ff87', color: '#000', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
//     error: { background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff6060', fontSize: 14, marginBottom: 16 } as React.CSSProperties,
//   };

//   return (
//     <main style={s.main}>
//       <div style={s.card}>
//         <div style={{ textAlign: 'center', marginBottom: 28 }}>
//           <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
//           <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Welcome back</h1>
//           <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>Enter your phone and PIN</p>
//         </div>

//         {error && <div style={s.error}>{error}</div>}

//         <form onSubmit={handleLogin}>
//           <label style={s.label}>Phone Number</label>
//           <input type="tel" placeholder="07012345678" value={phone}
//             onChange={e => setPhone(e.target.value)} required style={s.input} />

//           <label style={s.label}>4-digit PIN</label>
//           <input type="password" placeholder="••••" value={pin}
//             onChange={e => setPin(e.target.value)} maxLength={4} required
//             style={{ ...s.input, letterSpacing: 8 }} />

//           <button type="submit" disabled={loading} style={s.btn}>
//             {loading ? 'Signing in...' : 'Sign In →'}
//           </button>
//         </form>

//         <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
//           No account?{' '}
//           <Link href="/register" style={{ color: '#00ff87', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
//         </p>
//       </div>
//     </main>
//   );
// }


'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', pin: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await authAPI.login(form);
      localStorage.setItem('access_token', data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid phone or PIN';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="orb w-80 h-80" style={{ top: '-100px', right: '-80px', background: 'rgba(124,58,237,0.32)' }} />
      <div className="orb w-48 h-48" style={{ bottom: '40px', left: '-40px', background: 'rgba(168,85,247,0.2)', animationDelay: '3s' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(124,58,237,0.35)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: '24px' }}>Welcome back</h1>
          <p style={{ color: 'var(--muted)', marginTop: '6px', fontSize: '14px' }}>Sign in to your Alyra account</p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Phone number</label>
              <input className="inp" type="tel" placeholder="08012345678" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="label">4-digit PIN</label>
              <input className="inp" type="password" placeholder="••••" maxLength={4} value={form.pin}
                onChange={e => setForm({ ...form, pin: e.target.value })} required />
            </div>
            {error && <div className="err-box" style={{ marginBottom: '16px' }}>{error}</div>}
            <button className="btn btn-purple" type="submit" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--dim)', marginTop: '20px' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#a855f7', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </main>
  );
}