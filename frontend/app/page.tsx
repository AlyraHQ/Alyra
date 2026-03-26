import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold">A</div>
          <span className="font-bold text-lg tracking-tight">Alyra</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 transition">
            Login
          </Link>
          <Link href="/register" className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg font-medium transition">
            Get Started
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 text-brand-400 text-sm font-medium mb-8">
          ⚡ Smart Energy for Nigeria
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white max-w-3xl leading-tight mb-6">
          Power your home.{" "}
          <span className="text-brand-400">Never run out</span> again.
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
          Top up your prepaid meter or solar kit anytime. Get alerts before you run out.
          Pay in small amounts that match your income.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link href="/register" className="btn-primary text-center text-base">
            Create Free Account
          </Link>
          <Link href="/login" className="btn-outline text-center text-base">
            I have an account
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-14">
          {[
            " Prepaid Grid Meters",
            " Solar PAYG Systems",
            " Depletion Alerts",
            " Card, USSD & Bank Transfer",
            " Works on any phone",
          ].map((f) => (
            <span key={f} className="bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-2 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "₦50+", label: "Minimum top-up" },
            { value: "20-digit", label: "Secure energy tokens" },
            { value: "2 days", label: "Advance depletion alerts" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-400">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-gray-600 text-sm py-6 border-t border-gray-800">
        © {new Date().getFullYear()} Alyra · Built for Nigeria
      </footer>
    </main>
  );
}