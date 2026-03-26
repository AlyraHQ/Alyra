"use client";

interface Props {
  token: string;
  units: number;
  onClose: () => void;
}

export default function TokenModal({ token, units, onClose }: Props) {
  const formatted = token.match(/.{1,4}/g)?.join("-") ?? token;

  const copy = () => navigator.clipboard.writeText(token);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚡</span>
        </div>
        <h2 className="text-xl font-bold mb-1">Payment Successful!</h2>
        <p className="text-gray-400 text-sm mb-5">
          {units.toFixed(1)} kWh has been credited to your meter.
        </p>

        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Your Energy Token</p>
          <p className="text-2xl font-mono font-bold text-brand-300 tracking-widest break-all">
            {formatted}
          </p>
        </div>

        <p className="text-gray-500 text-xs mb-5">
          Enter this token on your prepaid meter keypad to credit your units.
        </p>

        <div className="flex gap-3">
          <button onClick={copy} className="flex-1 btn-outline text-sm py-2.5">
            Copy Token
          </button>
          <button onClick={onClose} className="flex-1 btn-primary text-sm py-2.5">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}