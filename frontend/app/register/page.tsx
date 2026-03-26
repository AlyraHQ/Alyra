// // 'use client';
// // import { useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import Link from 'next/link';
// // import { api } from '../../lib/api';

// // export default function Register() {
// //   const router = useRouter();
// //   const [form, setForm] = useState({ phone: '', pin: '', full_name: '' });
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (form.pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
// //     setLoading(true);
// //     setError('');
// //     try {
// //       await api.register(form.phone, form.pin, form.full_name);
// //       const res = await api.login(form.phone, form.pin);
// //       localStorage.setItem('alyra_token', res.data.access_token);
// //       router.push('/dashboard');
// //     } catch (err: unknown) {
// //       const message = err instanceof Error ? err.message : 'Registration failed';
// //       setError(message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
// //     setForm(prev => ({ ...prev, [field]: e.target.value }));

// //   return (
// //     <main style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
// //       <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(83,74,183,0.1)' }}>
// //         <div style={{ textAlign: 'center', marginBottom: 28 }}>
// //           <div style={{ fontSize: 32 }}>⚡</div>
// //           <h1 style={{ fontSize: 24, fontWeight: 700, color: '#534AB7', margin: '8px 0 4px' }}>Join Alyra</h1>
// //           <p style={{ color: '#888', fontSize: 14 }}>Get started with solar energy today</p>
// //         </div>

// //         {error && (
// //           <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 14px', color: '#c62828', fontSize: 14, marginBottom: 16 }}>{error}</div>
// //         )}

// //         <form onSubmit={handleSubmit}>
// //           {[
// //             { label: 'Full Name', field: 'full_name', type: 'text', placeholder: 'Mama Ngozi' },
// //             { label: 'Phone Number', field: 'phone', type: 'tel', placeholder: '+234 808 123 4567' },
// //             { label: '4-digit PIN', field: 'pin', type: 'password', placeholder: '••••' },
// //           ].map(({ label, field, type, placeholder }) => (
// //             <div key={field} style={{ marginBottom: 16 }}>
// //               <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>{label}</label>
// //               <input
// //                 type={type}
// //                 placeholder={placeholder}
// //                 value={form[field as keyof typeof form]}
// //                 onChange={update(field)}
// //                 maxLength={field === 'pin' ? 4 : undefined}
// //                 required
// //                 style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0deff', fontSize: 15, outline: 'none', boxSizing: 'border-box', letterSpacing: field === 'pin' ? 8 : 0 }}
// //               />
// //             </div>
// //           ))}

// //           <button
// //             type="submit"
// //             disabled={loading}
// //             style={{ width: '100%', background: loading ? '#9990d4' : '#534AB7', color: '#fff', padding: '14px', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
// //           >
// //             {loading ? 'Creating account...' : 'Create Account'}
// //           </button>
// //         </form>

// //         <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
// //           Already registered?{' '}
// //           <Link href="/login" style={{ color: '#534AB7', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
// //         </p>
// //       </div>
// //     </main>
// //   );
// // }

// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { api } from '../../lib/api';

// export default function Register() {
//   const router = useRouter();
//   const [form, setForm] = useState({ phone: '', pin: '', full_name: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (form.pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
//     setLoading(true);
//     setError('');
//     try {
//       await api.register(form.phone, form.pin, form.full_name);
//       const data = await api.login(form.phone, form.pin);
//       localStorage.setItem('alyra_token', data.access_token);
//       try {
//         const user = await api.me();
//         localStorage.setItem('alyra_user', JSON.stringify(user));
//       } catch { /* non-critical */ }
//       router.push('/dashboard');
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
//     setForm(prev => ({ ...prev, [field]: e.target.value }));

//   const s = {
//     main: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
//     card: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 } as React.CSSProperties,
//     label: { display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6 } as React.CSSProperties,
//     input: { width: '100%', padding: '13px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 16, fontFamily: 'inherit' },
//     btn: { width: '100%', background: loading ? '#555' : '#00ff87', color: '#000', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, fontFamily: 'inherit' } as React.CSSProperties,
//     error: { background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff6060', fontSize: 14, marginBottom: 16 } as React.CSSProperties,
//   };

//   return (
//     <main style={s.main}>
//       <div style={s.card}>
//         <div style={{ textAlign: 'center', marginBottom: 28 }}>
//           <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
//           <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Join Alyra</h1>
//           <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>Get started with smart energy today</p>
//         </div>

//         {error && <div style={s.error}>{error}</div>}

//         <form onSubmit={handleSubmit}>
//           {[
//             { label: 'Full Name', field: 'full_name', type: 'text', placeholder: 'Mama Ngozi' },
//             { label: 'Phone Number', field: 'phone', type: 'tel', placeholder: '07012345678' },
//             { label: '4-digit PIN', field: 'pin', type: 'password', placeholder: '••••' },
//           ].map(({ label, field, type, placeholder }) => (
//             <div key={field}>
//               <label style={s.label}>{label}</label>
//               <input
//                 type={type} placeholder={placeholder}
//                 value={form[field as keyof typeof form]}
//                 onChange={update(field)}
//                 maxLength={field === 'pin' ? 4 : undefined}
//                 required
//                 style={{ ...s.input, letterSpacing: field === 'pin' ? 8 : 0 }}
//               />
//             </div>
//           ))}

//           <button type="submit" disabled={loading} style={s.btn}>
//             {loading ? 'Creating account...' : 'Create Account →'}
//           </button>
//         </form>

//         <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
//           Already registered?{' '}
//           <Link href="/login" style={{ color: '#00ff87', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
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

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', pin: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.register(form);
      router.push('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="orb w-80 h-80" style={{ top: '-80px', left: '-80px', background: 'rgba(124,58,237,0.3)' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(124,58,237,0.35)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: '24px' }}>Create account</h1>
          <p style={{ color: 'var(--muted)', marginTop: '6px', fontSize: '14px' }}>Start buying energy tokens today</p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Full name</label>
              <input className="inp" type="text" placeholder="Ngozi Adeyemi" value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Phone number</label>
              <input className="inp" type="tel" placeholder="08012345678" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label className="label">Create 4-digit PIN</label>
              <input className="inp" type="password" placeholder="••••" maxLength={4} value={form.pin}
                onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g,'') })} required />
              <p style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '6px' }}>You&apos;ll use this PIN to confirm payments</p>
            </div>
            {error && <div className="err-box" style={{ margin: '14px 0' }}>{error}</div>}
            <button className="btn btn-purple" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--dim)', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#a855f7', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}