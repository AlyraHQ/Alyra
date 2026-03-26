"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem("alyra_token");
    router.push("/login");
  };

  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/buy", label: "Buy Energy" },
    { href: "/dashboard/transactions", label: "History" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-sm font-bold">
              A
            </div>
            <span className="font-bold text-white tracking-tight">Alyra</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  pathname === l.href
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex z-50">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 py-3 text-center text-xs font-medium transition ${
              pathname === l.href ? "text-brand-400" : "text-gray-500"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}