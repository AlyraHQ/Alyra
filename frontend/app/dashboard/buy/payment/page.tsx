'use client';
import { useState,  Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const deviceId = params.get('device') ?? '';
  const amount = Number(params.get('amount') ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.initiatePayment(deviceId, amount * 100, 'web');
      
      // Interswitch requires a FORM POST — not a URL redirect
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = res.payment_url;

      const fields = res.form_fields;
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();   // ← This is what actually works with Interswitch
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: 14, cursor: 'pointer', color: '#374151' }}>
          Back
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Payment</span>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

        {/* Order summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 16 }}>Order Summary</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
            <span style={{ color: '#6b7280' }}>Energy purchase</span>
            <span style={{ fontWeight: 600 }}>₦{amount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
            <span style={{ color: '#6b7280' }}>Estimated units</span>
            <span>~{(amount / 85).toFixed(1)} kWh</span>
          </div>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
            <span>Total</span>
            <span style={{ color: '#1a56db' }}>₦{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 14 }}>Accepted payment methods</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '', label: 'Debit / Credit Card' },
              { icon: '', label: 'Bank Transfer' },
              { icon: '', label: 'USSD' },
              { icon: '', label: 'Mobile Money' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                <span>{m.icon}</span>
                <span style={{ fontSize: 13, color: '#374151' }}>{m.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
            You will be redirected to the secure Interswitch payment page.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading || !amount}
          style={{ width: '100%', background: loading ? '#93c5fd' : '#1a56db', color: '#fff', padding: 15, borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Redirecting to Interswitch...' : `Pay ₦${amount.toLocaleString()} securely`}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
          Secured by Interswitch · Card, USSD, and bank transfer accepted
        </p>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}