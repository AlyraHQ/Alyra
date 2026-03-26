"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import { getMyDevices, Device } from "@/lib/api";

const PRESET_AMOUNTS = [200, 500, 1000, 2000, 5000];

function BuyEnergyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const preselectedDevice = params.get("device");
  const preselectedAmount = params.get("amount");

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [amount, setAmount] = useState<number | "">(preselectedAmount ? Number(preselectedAmount) : "");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const devs = await getMyDevices();
        setDevices(devs);
        if (preselectedDevice) setSelectedDevice(preselectedDevice);
        else if (devs.length > 0) setSelectedDevice(devs[0].id);
      } finally {
        setLoading(false);
      }
    })();
  }, [preselectedDevice]);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleProceed = () => {
    if (!selectedDevice || !finalAmount || Number(finalAmount) < 50) return;
    router.push(`/dashboard/buy/payment?device=${selectedDevice}&amount=${finalAmount}`);
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading…</div>;

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Buy Energy</h1>
        <p className="text-gray-400 text-sm mt-1">Select an amount and proceed to pay</p>
      </div>

      {/* Device selector */}
      {devices.length > 1 && (
        <div className="card space-y-3">
          <p className="text-sm font-medium text-gray-300">Select Device</p>
          {devices.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDevice(d.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                selectedDevice === d.id
                  ? "border-brand-500 bg-brand-500/10 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              <span className="text-sm">
                {d.device_type === "grid_meter" ? "⚡" : "☀️"} {d.meter_number}
              </span>
              <span className="text-xs text-gray-500">
                {d.device_type === "grid_meter" ? `${d.current_units.toFixed(1)} kWh` : `${d.battery_percentage}%`}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Preset amounts */}
      <div className="card space-y-3">
        <p className="text-sm font-medium text-gray-300">Select Amount</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => { setAmount(a); setCustomAmount(""); }}
              className={`py-3 rounded-xl border text-sm font-semibold transition ${
                amount === a && !customAmount
                  ? "border-brand-500 bg-brand-500/20 text-brand-300"
                  : "border-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              ₦{a.toLocaleString()}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Or enter custom amount (min ₦50)</label>
          <input
            type="number"
            className="input"
            placeholder="e.g. 750"
            min={50}
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
          />
        </div>
      </div>

      {/* Summary */}
      {finalAmount && Number(finalAmount) >= 50 && (
        <div className="card bg-brand-500/10 border-brand-500/30">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">You pay</span>
            <span className="font-bold text-brand-300">₦{Number(finalAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Estimated units</span>
            <span className="font-medium text-white">~{(Number(finalAmount) / 85).toFixed(1)} kWh</span>
          </div>
        </div>
      )}

      <button
        onClick={handleProceed}
        disabled={!selectedDevice || !finalAmount || Number(finalAmount) < 50}
        className="btn-primary"
      >
        Proceed to Payment
      </button>
    </main>
  );
}

export default function BuyPage() {
  return (
    <>
      <NavBar />
      <Suspense fallback={<div className="text-center py-16 text-gray-500">Loading…</div>}>
        <BuyEnergyContent />
      </Suspense>
    </>
  );
}