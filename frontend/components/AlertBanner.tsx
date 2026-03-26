"use client";

import Link from "next/link";
import { Prediction } from "@/lib/api";

interface Props {
  prediction: Prediction | null;
  deviceId: string;
}

export default function AlertBanner({ prediction, deviceId }: Props) {
  if (!prediction) return null;
  const hours = prediction.predicted_depletion_hours;
  if (hours > 48) return null;

  const timeLabel =
    hours >= 24
      ? `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? "s" : ""}`
      : `${hours} hour${hours !== 1 ? "s" : ""}`;

  return (
    <div className="bg-amber-900/40 border border-amber-600/50 rounded-2xl p-4 flex items-start gap-3">
      <span className="text-2xl"></span>
      <div className="flex-1">
        <p className="font-semibold text-amber-300 text-sm">Low Energy Alert</p>
        <p className="text-amber-100/80 text-sm mt-0.5">
          You have <strong>{prediction.current_units.toFixed(1)} kWh</strong> remaining.
          Predicted to run out in <strong>{timeLabel}</strong>.
        </p>
        <p className="text-amber-100/70 text-sm mt-0.5">
          Recommended top-up:{" "}
          <strong>
            ₦{prediction.recommended_topup_naira.toLocaleString()} (~{prediction.recommended_units.toFixed(1)} kWh)
          </strong>
        </p>
      </div>
      <Link
        href={`/dashboard/buy?device=${deviceId}&amount=${prediction.recommended_topup_naira}`}
        className="shrink-0 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs px-3 py-2 rounded-lg transition"
      >
        Buy Now
      </Link>
    </div>
  );
}