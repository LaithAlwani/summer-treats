"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

const NAV = [
  { href: "/admin", label: "Orders", emoji: "📋", exact: true },
  { href: "/admin/items", label: "Items", emoji: "🧁", exact: false },
  { href: "/admin/schedule", label: "Schedule", emoji: "📅", exact: false },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <AuthLoading>
        <p className="py-20 text-center font-semibold text-cocoa/50">Loading…</p>
      </AuthLoading>
      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>
      <Authenticated>
        <Shell>{children}</Shell>
      </Authenticated>
    </div>
  );
}

function RedirectToLogin() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);
  return null;
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/admin/login");
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b-2 border-cocoa/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <span className="font-display text-xl font-extrabold text-watermelon">
            🍪 Admin
          </span>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-watermelon text-white"
                      : "text-cocoa hover:bg-cocoa/5"
                  }`}
                >
                  <span aria-hidden>{item.emoji}</span>{" "}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/"
              target="_blank"
              className="ml-1 rounded-full bg-blueberry px-3 py-2 text-sm font-bold text-white transition hover:brightness-105"
            >
              <span aria-hidden>🌐</span>{" "}
              <span className="hidden sm:inline">View site</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full px-3 py-2 text-sm font-bold text-cocoa/60 hover:text-watermelon"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </>
  );
}
