'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const txnRef = searchParams.get('txnref') || searchParams.get('reference') || '';
  const resp = searchParams.get('resp') || '';
  const status: 'success' | 'failed' = resp === '00' || resp === '' ? 'success' : 'failed';

  return (
    <main style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 4px 24px rgba(83,74,183,0.1)' }}>
        {status === 'success' ? (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>✓</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#222', marginBottom: 8 }}>Payment Successful!</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              Your energy token has been generated and sent to your phone via SMS.
            </p>
            <div style={{ background: '#EEEDFE', borderRadius: 12, padding: '16px', marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#534AB7', marginBottom: 8 }}>Transaction Reference</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#3C3489', wordBreak: 'break-all' }}>{txnRef}</div>
              <div style={{ fontSize: 12, color: '#7F77DD', marginTop: 8 }}>Check your SMS for the token code</div>
            </div>
            <Link href="/dashboard" style={{ display: 'block', background: '#534AB7', color: '#fff', padding: '14px', borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Back to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>✕</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#222', marginBottom: 8 }}>Payment Failed</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>Your payment was not completed. No charge was made.</p>
            <Link href="/dashboard/buy" style={{ display: 'block', background: '#534AB7', color: '#fff', padding: '14px', borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: 'none', marginBottom: 12 }}>
              Try Again
            </Link>
            <Link href="/dashboard" style={{ display: 'block', color: '#534AB7', fontSize: 14, textDecoration: 'none' }}>
              Back to Dashboard
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
