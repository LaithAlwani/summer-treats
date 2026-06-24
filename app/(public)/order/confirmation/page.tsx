"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCart } from "@/lib/cart";
import { formatOrderText, igDmUrl } from "@/lib/format";

const IG = process.env.NEXT_PUBLIC_IG_USERNAME ?? "summertreatskids";

function Confirmation() {
  const search = useSearchParams();
  const orderId = search.get("orderId") as Id<"orders"> | null;
  const order = useQuery(
    api.orders.getById,
    orderId ? { orderId } : "skip",
  );
  const { clear } = useCart();
  const [copied, setCopied] = useState(false);
  const clearedRef = useRef(false);

  // The order is saved; empty the local cart once.
  useEffect(() => {
    if (!clearedRef.current) {
      clearedRef.current = true;
      clear();
    }
  }, [clear]);

  if (!orderId || order === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-4xl">🤔</p>
        <p className="mt-3 text-xl font-bold">We couldn&apos;t find that order.</p>
        <Link href="/" className="mt-4 inline-block font-bold text-grape underline">
          ← Back to the menu
        </Link>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <p className="py-16 text-center font-semibold text-cocoa/50">Loading… 🍪</p>
    );
  }

  const text = formatOrderText(order);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function sendToInstagram() {
    await copyText();
    window.location.href = igDmUrl(IG);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="ticket px-6 py-8 text-center shadow-[0_18px_30px_-18px_rgba(74,59,50,0.5)]">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-2 text-4xl text-emerald-600">Order saved!</h1>
        <p className="handw mt-2 text-xl text-cocoa/70">
          one quick step — send it to us on Instagram so we can confirm
        </p>

        {/* Steps */}
        <ol className="mx-auto mt-5 max-w-sm space-y-2 text-left">
          <Step n={1}>Tap the button below — it copies your order.</Step>
          <Step n={2}>
            Instagram opens our DMs (<b>@{IG}</b>). Paste &amp; send!
          </Step>
          <Step n={3}>We&apos;ll reply to confirm. Pay at pickup 💵</Step>
        </ol>

        <button
          onClick={sendToInstagram}
          className="mt-6 w-full rounded-full bg-grape px-6 py-4 font-display text-xl font-extrabold text-white shadow-lg transition hover:brightness-105"
        >
          📋 Copy &amp; open Instagram DMs
        </button>

        {/* Fallback: the order text, always visible & selectable */}
        <div className="mt-6 text-left">
          <p className="text-sm font-bold text-cocoa/60">
            Your order (copy this if needed):
          </p>
          <textarea
            readOnly
            value={text}
            rows={text.split("\n").length + 1}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-1 w-full resize-none rounded-2xl border-2 border-cocoa/15 bg-cream p-3 font-mono text-sm"
          />
          <button
            onClick={copyText}
            className="mt-2 rounded-full border-2 border-cocoa/15 px-4 py-2 text-sm font-bold text-cocoa hover:border-cocoa/30"
          >
            {copied ? "Copied! ✓" : "Copy again"}
          </button>
        </div>

        <p className="mt-5 text-xs text-cocoa/50">
          Tip: the Instagram button works best on your phone. On a computer you
          can copy the text above and message us however you like.
        </p>

        <Link
          href="/"
          className="mt-5 inline-block font-bold text-grape underline"
        >
          ← Back to the menu
        </Link>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-grape font-display text-sm font-extrabold text-white">
        {n}
      </span>
      <span className="text-cocoa/80">{children}</span>
    </li>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center font-semibold text-cocoa/50">Loading…</p>
      }
    >
      <Confirmation />
    </Suspense>
  );
}
