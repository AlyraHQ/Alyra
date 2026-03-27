
'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="logo">
          <div className="logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
          </div>
          <span className="logo-text">Alyra</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/login"><button className="btn btn-secondary btn-sm">Sign in</button></Link>
          <Link href="/register"><button className="btn btn-primary btn-sm">Get started</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
        <div className="badge badge-purple" style={{ marginBottom: '24px', fontSize: '13px' }}>Smart energy for Nigeria</div>

        <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em' }}>
          Energy access,<br/>
          <span style={{ color: 'var(--purple-400)' }}>without surprises.</span>
        </h1>

        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.65, marginBottom: '36px' }}>
          Alyra lets households buy electricity and solar energy tokens in seconds. Predicts when power runs out. Works on any phone.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register"><button className="btn btn-primary" style={{ width: 'auto', padding: '14px 28px', fontSize: '16px' }}>Create account</button></Link>
          <Link href="/login"><button className="btn btn-secondary" style={{ width: 'auto', padding: '14px 28px', fontSize: '16px' }}>Sign in</button></Link>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '60px', width: '100%', textAlign: 'left' }}>
          {[
            { title: 'Grid Meters', desc: 'Top up prepaid meters. Receive a 20-digit STS token via SMS.' },
            { title: 'Solar PAYG', desc: 'Pay-as-you-go solar kits. Unlock daily access with micro-payments.' },
            { title: 'Predictive Alerts', desc: 'Know before your power runs out. Alerts sent before depletion.' },
          ].map(f => (
            <div key={f.title} className="card-sm" style={{ borderRadius: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        © 2025 Alyra Energy — Built for Nigeria
      </footer>
    </div>
  );
}