'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#534AB7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#EEEDFE', margin: '0 0 8px' }}>
          Alyra
        </h1>
        <p style={{ color: '#AFA9EC', fontSize: 16, marginBottom: 8 }}>
          Smart Energy Platform
        </p>
        <p style={{ color: '#EEEDFE', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
          Power your home with solar energy. Buy tokens instantly from any phone no smartphone needed.
        </p>

        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <Link href="/register" style={{
            background: '#fff',
            color: '#534AB7',
            padding: '14px 24px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
            display: 'block',
          }}>
            Get Started
          </Link>
          <Link href="/login" style={{
            border: '2px solid #AFA9EC',
            color: '#EEEDFE',
            padding: '13px 24px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
            display: 'block',
          }}>
            Sign In
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 48 }}>
          {[['80M+', 'Off-grid Nigerians'], ['60s', 'Token delivery'], ['92%', 'Cheaper than gen']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#EEEDFE' }}>{val}</div>
              <div style={{ fontSize: 11, color: '#AFA9EC' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}