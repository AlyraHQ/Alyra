"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import TokenModal from "@/components/TokenModal";
import { verifyPayment } from "@/lib/api";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [token, setToken] = useState("");
  const [units, setUnits] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const reference =
      params.get("reference") ||
      params.get("txref") ||
      localStorage.getItem("alyra_tx_ref") ||
      "";

    if (!reference) { setStatus("failed"); return; }

    (async () => {
      try {
        const res = await verifyPayment(reference);
        if (res.status === "success" && res.token) {
          setToken(res.token);
          setUnits(res.units_credited ?? 0);
          setStatus("success");
          setShowModal(true);
          localStorage.removeItem("alyra_tx_ref");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    })();
  }, [params]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="card text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your payment could not be verified. No units were deducted. Please try again.
          </p>
          <Link href="/dashboard/buy" className="btn-primary">
            Try Again
          </Link>
          <Link href="/dashboard" className="block text-center text-gray-500 text-sm mt-3 hover:text-gray-300 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <TokenModal
          token={token}
          units={units}
          onClose={() => { setShowModal(false); router.push("/dashboard"); }}
        />
      )}
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="card text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Payment Successful</h2>
          <p className="text-gray-400 text-sm mb-6">
            {units.toFixed(1)} kWh has been credited. Your token is ready.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary mb-3">
            View Energy Token
          </button>
          <Link href="/dashboard" className="block text-center text-gray-500 text-sm hover:text-gray-300 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-500">Verifying…</div>}>
      <CallbackContent />
    </Suspense>
  );
}