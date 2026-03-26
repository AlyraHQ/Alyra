"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import AlertBanner from "@/components/AlertBanner";
import { getMyDevices, getDevicePrediction, Device, Prediction } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("alyra_token");
    if (!token) { router.push("/login"); return; }

    (async () => {
      try {
        const devs = await getMyDevices();
        setDevices(devs);
        const preds: Record<string, Prediction> = {};
        await Promise.all(
          devs.map(async (d) => {
            try {
              preds[d.id] = await getDevicePrediction(d.id);
            } catch { /* no prediction yet */ }
          })
        );
        setPredictions(preds);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load devices.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <>
      <NavBar />
      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Your energy at a glance</p>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-500">Loading your devices…</div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!loading && devices.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-gray-400 mb-4">No devices linked to your account yet.</p>
            <p className="text-gray-600 text-sm">Contact support to add your meter or solar kit.</p>
          </div>
        )}

        {devices.map((device) => (
          <div key={device.id} className="space-y-3">
            {/* Alert banner if prediction is low */}
            <AlertBanner prediction={predictions[device.id] ?? null} deviceId={device.id} />

            {/* Device card */}
            <div className="card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
                    {device.device_type === "grid_meter" ? "⚡ Grid Meter" : "☀️ Solar PAYG"}
                  </span>
                  <p className="font-mono text-gray-300 text-sm mt-0.5">{device.meter_number}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  device.is_active
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {device.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Units / Battery */}
              {device.device_type === "grid_meter" ? (
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-400">Units remaining</span>
                    <span className="font-bold text-white">{device.current_units.toFixed(1)} kWh</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((device.current_units / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-400">Battery level</span>
                    <span className="font-bold text-white">{device.battery_percentage ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all"
                      style={{ width: `${device.battery_percentage ?? 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Prediction info */}
              {predictions[device.id] && (
                <p className="text-xs text-gray-500">
                  Predicted to last ~{predictions[device.id].predicted_depletion_hours}h ·{" "}
                  Suggested top-up: ₦{predictions[device.id].recommended_topup_naira.toLocaleString()}
                </p>
              )}

              <Link
                href={`/dashboard/buy?device=${device.id}`}
                className="btn-primary text-center block text-sm py-2.5"
              >
                Buy Energy
              </Link>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}