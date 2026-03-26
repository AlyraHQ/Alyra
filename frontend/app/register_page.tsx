"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", phone: "", pin: "", confirm_pin: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.pin !== form.confirm_pin) return setError("PINs do not match.");
    if (form.pin.length < 4) return setError("PIN must be at least 4 digits.");
    setLoading(true);
    try {
      await register({ full_name: form.full_name, phone: form.phone, pin: form.pin });
      router.push("/login?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-950 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-lg">A</div>
          <span className="font-bold text-xl tracking-tight">Alyra</span>
        </Link>

        <div className="card">
          <h1 className="text-xl font-bold mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-6">Start managing your energy smarter</p>

          {error && (
            <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="Amara Okafor" value={form.full_name} onChange={set("full_name")} required />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" className="input" placeholder="08012345678" value={form.phone} onChange={set("phone")} required />
            </div>
            <div>
              <label className="label">Create PIN</label>
              <input type="password" className="input" placeholder="4–6 digit PIN" maxLength={6} value={form.pin} onChange={set("pin")} required />
            </div>
            <div>
              <label className="label">Confirm PIN</label>
              <input type="password" className="input" placeholder="Repeat your PIN" maxLength={6} value={form.confirm_pin} onChange={set("confirm_pin")} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}