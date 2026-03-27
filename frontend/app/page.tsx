import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e5e7eb', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#1a56db', letterSpacing: '-0.5px' }}>Alyra</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{ color: '#4b5563', fontWeight: 500, textDecoration: 'none', padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}>Sign In</Link>
          <Link href="/register" style={{ background: '#1a56db', color: '#fff', fontWeight: 600, textDecoration: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 14 }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1a56db', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, marginBottom: 20, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Smart Energy Platform
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, color: '#111827', marginBottom: 18, maxWidth: 600, letterSpacing: '-1px' }}>
          Know exactly when your power will run out — before it does
        </h1>
        <p style={{ fontSize: 17, color: '#4b5563', lineHeight: 1.65, maxWidth: 540, marginBottom: 32 }}>
          Alyra unifies grid prepaid meters and solar PAYG systems. Buy energy tokens, get predictive depletion alerts, and top up in amounts that match your income — from any phone, with or without internet.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/register" style={{ background: '#1a56db', color: '#fff', fontWeight: 600, padding: '13px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}>Create Account</Link>
          <Link href="/login" style={{ color: '#1a56db', fontWeight: 600, padding: '13px 24px', borderRadius: 10, textDecoration: 'none', fontSize: 15, border: '1.5px solid #1a56db' }}>Sign In</Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { stat: '80M+', label: 'Nigerians without reliable electricity' },
            { stat: '60 sec', label: 'Average time to receive energy token' },
            { stat: '100%', label: 'Works on feature phones, no internet needed' },
          ].map(({ stat, label }) => (
            <div key={stat} style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1a56db', marginBottom: 6 }}>{stat}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: '-0.5px' }}>How Alyra works</h2>
        <p style={{ color: '#6b7280', marginBottom: 40, fontSize: 15 }}>Three steps to reliable electricity</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { n: '01', title: 'Register your device', desc: 'Link your grid meter or solar kit. Choose your energy vendor. One account covers both.' },
            { n: '02', title: 'Buy in small amounts', desc: 'Select any amount from 100 naira upward. Pay via card, USSD, or bank transfer through Interswitch.' },
            { n: '03', title: 'Get alerts before outages', desc: 'Alyra tracks your usage and sends an alert 24 hours before your power runs out, with a recommended top-up amount.' },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a56db', background: '#dbeafe', display: 'inline-block', padding: '3px 10px', borderRadius: 6, marginBottom: 14 }}>{n}</div>
              <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: 8, fontSize: 16 }}>{title}</h3>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        Alyra — Smart Energy Payments for Nigeria
      </footer>
    </main>
  );
}