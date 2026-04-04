"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/generate", label: "Generate", icon: "✨" },
  { href: "/history", label: "History", icon: "📜" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [usage, setUsage] = useState({ used: 0, limit: 3, remaining: 3 });

  useEffect(() => {
    if (!session) return;
    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUsage(d))
      .catch(() => {});
  }, [session, pathname]);

  return (
    <aside className="w-64 h-screen bg-gray-950 border-r border-gray-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="text-xl font-bold text-white">
          ThreadCraft <span className="text-indigo-400">AI</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Free tier usage */}
      {session?.user && (
        <div className="px-4 pb-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">
                Free Tier
              </span>
              <span
                className={`text-xs font-mono ${
                  usage.remaining === 0
                    ? "text-red-400"
                    : usage.remaining === 1
                    ? "text-yellow-400"
                    : "text-emerald-400"
                }`}
              >
                {usage.used}/{usage.limit} today
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usage.remaining === 0
                    ? "bg-red-500"
                    : usage.remaining === 1
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${(usage.used / usage.limit) * 100}%`,
                }}
              />
            </div>
            {usage.remaining === 0 && (
              <p className="text-[10px] text-red-400 mt-1.5">
                Daily limit reached. Resets at midnight.
              </p>
            )}
          </div>
        </div>
      )}

      {session?.user && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-gray-300 truncate">
              {session.user.name}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
