"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ phone, pin });
      localStorage.setItem("alyra_token", data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check your phone and PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-950">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-lg">A</div>
          <span className="font-bold text-xl tracking-tight">Alyra</span>
        </Link>

        <div className="card">
          <h1 className="text-xl font-bold mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to your Alyra account</p>

          {error && (
            <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">PIN</label>
              <input
                type="password"
                className="input"
                placeholder="Enter your PIN"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          No account?{" "}
          <Link href="/register" className="text-brand-400 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}