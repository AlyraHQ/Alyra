"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { initiatePayment } from "@/lib/api";

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const deviceId = params.get("device") ?? "";
  const amount = Number(params.get("amount") ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await initiatePayment({ device_id: deviceId, amount });
      // Save reference so callback page can verify
      localStorage.setItem("alyra_tx_ref", res.transaction_reference);
      // Redirect to Interswitch payment page
      window.location.href = res.payment_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment.");
      setLoading(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Payment</h1>
        <p className="text-gray-400 text-sm mt-1">Secure payment via Interswitch</p>
      </div>

      {/* Order summary */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold text-gray-300 mb-1">Order Summary</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Energy purchase</span>
          <span className="text-white font-medium">₦{amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Estimated units</span>
          <span className="text-white">~{(amount / 85).toFixed(1)} kWh</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Processing fee</span>
          <span className="text-green-400">Free</span>
        </div>
        <div className="border-t border-gray-700 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-brand-400">₦{amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment methods info */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold text-gray-300">Accepted payment methods</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "💳", label: "Debit / Credit Card" },
            { icon: "🏦", label: "Bank Transfer" },
            { icon: "📱", label: "USSD" },
            { icon: "💰", label: "Mobile Money" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2.5">
              <span>{m.icon}</span>
              <span className="text-sm text-gray-300">{m.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          You will be redirected to the secure Interswitch payment page to complete your transaction.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button onClick={handlePay} disabled={loading || !amount} className="btn-primary">
        {loading ? "Redirecting to Interswitch…" : `Pay ₦${amount.toLocaleString()} securely`}
      </button>

      <button
        onClick={() => router.back()}
        className="w-full text-center text-gray-500 text-sm hover:text-gray-300 transition py-2"
      >
        ← Go back
      </button>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <>
      <NavBar />
      <Suspense fallback={<div className="text-center py-16 text-gray-500">Loading…</div>}>
        <PaymentContent />
      </Suspense>
    </>
  );
}