'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useRef } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';

function CallbackContent() {
  const params = useSearchParams();
  const txnRef = params.get('txnref') || params.get('reference') || '';
  const resp = params.get('resp') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [tokenCode, setTokenCode] = useState('');
  const [units, setUnits] = useState('');
  const [errMsg, setErrMsg] = useState('');
  
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent processing multiple times
    if (hasProcessed.current) return;
    
    const processPayment = async () => {
      // Handle initial validation
      if (!txnRef) {
        setStatus('failed');
        hasProcessed.current = true;
        return;
      }
      
      if (resp && resp !== '00') {
        setStatus('failed');
        hasProcessed.current = true;
        return;
      }

      try {
        const data = await api.testConfirm(txnRef);
        setTokenCode(data.token_code || '');
        setUnits(data.units || '');
        setStatus('success');
      } catch (err) {
        setErrMsg(err instanceof Error ? err.message : 'Could not confirm payment');
        setStatus('failed');
      } finally {
        hasProcessed.current = true;
      }
    };

    processPayment();
  }, [txnRef, resp]); // Dependencies remain the same

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db', fontSize: 15 }}>
      Confirming your payment...
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '36px 28px', width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>

        {status === 'success' ? (
          <>
            <div style={{ width: 60, height: 60, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 26, color: '#16a34a', fontWeight: 700 }}>&#10003;</div>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Payment Successful</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Your energy token has been generated. Enter it on your meter keypad.</p>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '22px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Your Energy Token</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#15803d', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 8 }}>
                {tokenCode || '— — — — —'}
              </div>
              <div style={{ fontSize: 13, color: '#166534' }}>{units}</div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', marginBottom: 24, fontSize: 12, color: '#9ca3af', textAlign: 'left' as const }}>
              Transaction ref: {txnRef}
            </div>

            <Link href="/dashboard" style={{ display: 'block', background: '#1a56db', color: '#fff', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              Back to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div style={{ width: 60, height: 60, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 26, color: '#dc2626', fontWeight: 700 }}>&#10007;</div>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Payment Not Completed</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>No charge was made to your account.</p>
            {errMsg && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{errMsg}</p>}
            <Link href="/dashboard/buy" style={{ display: 'block', background: '#1a56db', color: '#fff', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 12 }}>
              Try Again
            </Link>
            <Link href="/dashboard" style={{ display: 'block', color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
              Return to Dashboard
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}