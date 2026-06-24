"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AdminLoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn("password", { email, password, flow });
      router.push("/admin");
    } catch {
      setError(
        flow === "signIn"
          ? "Wrong email or password."
          : "Could not create the account. It may already exist.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-blob bg-white p-7 shadow-[0_8px_0_0_rgba(74,59,50,0.08)]">
        <div className="text-center">
          <p className="text-4xl">🍪🔑</p>
          <h1 className="mt-2 text-2xl text-watermelon">Summer Treats Admin</h1>
          <p className="mt-1 text-sm text-cocoa/60">
            {flow === "signIn"
              ? "Sign in to manage the menu and orders."
              : "Create the owner account (do this once)."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="input"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={flow === "signIn" ? "current-password" : "new-password"}
            className="input"
          />
          {error && (
            <p className="rounded-2xl bg-watermelon/10 px-3 py-2 text-center text-sm font-semibold text-watermelon">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-watermelon px-6 py-3 font-display text-lg font-extrabold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
          >
            {busy ? "…" : flow === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => {
            setFlow(flow === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          className="mt-4 w-full text-center text-sm font-semibold text-grape underline"
        >
          {flow === "signIn"
            ? "First time? Create the owner account"
            : "← Back to sign in"}
        </button>
      </div>
    </div>
  );
}
