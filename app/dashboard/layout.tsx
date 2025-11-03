"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  async function handleLogout() {
    try {
      await fetch("/api/auth/signin", { method: "DELETE" });
      router.push("/signin");
    } catch {}
  }

  useEffect(() => {
    // simple client-side cookie check
    setIsAuthed(document.cookie.includes("auth_token="));
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-gray-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900" onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation">
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="font-semibold">Dashboard</Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isAuthed ? (
              <button className="hidden sm:inline-flex px-3 py-2 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-900" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link href="/signin" className="hidden sm:inline-flex px-3 py-2 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-900">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[240px_1fr] gap-0">
        {/* Sidebar */}
        <aside className={`border-r bg-white dark:bg-gray-950 p-4 md:block ${open ? "block" : "hidden"} md:sticky md:top-14 md:h-[calc(100vh-56px)] md:overflow-y-auto`}>
          <nav className="flex md:flex-col items-start md:items-stretch gap-3">
            <Link href="/dashboard/products" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900 w-full">Products</Link>
            <Link href="/dashboard/orders" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900 w-full">Orders</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
  