"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { getTransactions, Transaction } from "@/lib/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusStyle = {
    success: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    failed: "bg-red-500/20 text-red-400",
  };

  return (
    <>
      <NavBar />
      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-gray-400 text-sm mt-1">All your energy purchases</p>
        </div>

        {loading && <div className="text-center py-16 text-gray-500">Loading…</div>}
        {error && (
          <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-gray-400">No transactions yet.</p>
            <p className="text-gray-600 text-sm mt-1">Buy energy to see your history here.</p>
          </div>
        )}

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="card flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-white">₦{tx.amount.toLocaleString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[tx.status]}`}>
                    {tx.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {tx.units_purchased.toFixed(1)} kWh ·{" "}
                  {new Date(tx.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              {tx.token && (
                <button
                  onClick={() => setSelectedToken(tx.token!)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium transition"
                >
                  View Token
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Token viewer */}
      {selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Energy Token</p>
            <p className="text-2xl font-mono font-bold text-brand-300 tracking-widest break-all mb-6">
              {selectedToken.match(/.{1,4}/g)?.join("-") ?? selectedToken}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(selectedToken)}
                className="flex-1 btn-outline text-sm py-2.5"
              >
                Copy
              </button>
              <button
                onClick={() => setSelectedToken(null)}
                className="flex-1 btn-primary text-sm py-2.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
