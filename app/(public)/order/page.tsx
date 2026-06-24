"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { prettyDateLong } from "@/lib/dates";
import { formatWindow } from "@/lib/time";
import { QuantityStepper } from "@/components/QuantityStepper";
import { ClosedBanner } from "@/components/ClosedBanner";

export default function OrderPage() {
  const router = useRouter();
  const { state, setQuantity, remove, total, count } = useCart();
  const createOrder = useMutation(api.orders.create);
  const status = useQuery(api.settings.getStoreStatus, {});
  const ordersOpen = status?.acceptingPreorders ?? true;
  const windows = status?.pickupWindows ?? [];

  const [name, setName] = useState("");
  const [igHandle, setIgHandle] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupWindow, setPickupWindow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (count === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-3 text-2xl font-bold text-cocoa">Your order is empty</p>
        <p className="mt-1 text-cocoa/60">Add some treats from the menu first!</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full bg-watermelon px-6 py-3 font-display font-bold text-white shadow-md"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please add your name so we know whose order it is!");
      return;
    }
    if (!state.pickupDate) {
      setError("Something's off with the pickup date. Try re-adding items.");
      return;
    }
    if (windows.length > 0 && !pickupWindow) {
      setError("Please choose a pickup time.");
      return;
    }
    setSubmitting(true);
    try {
      const orderId = await createOrder({
        customerName: name,
        igHandle: igHandle || undefined,
        contact: contact || undefined,
        notes: notes || undefined,
        pickupDate: state.pickupDate,
        pickupWindow: pickupWindow || undefined,
        items: state.lines.map((l) => ({
          itemId: l.itemId,
          quantity: l.quantity,
        })),
      });
      router.push(`/order/confirmation?orderId=${orderId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not place the order.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/" className="handw text-lg text-grape underline">
        ← keep shopping
      </Link>
      <h1 className="mt-2 text-4xl text-watermelon">Your preorder</h1>
      {state.pickupDate && (
        <p className="handw mt-1 text-xl text-cocoa/70">
          for pickup {prettyDateLong(state.pickupDate)}
        </p>
      )}

      {!ordersOpen && (
        <div className="mt-5">
          <ClosedBanner message={status?.closedMessage} />
        </div>
      )}

      {/* Order ticket */}
      <div className="ticket mt-5 px-5 py-6 shadow-[0_18px_30px_-18px_rgba(74,59,50,0.5)]">
        <p className="handw text-center text-xl text-cocoa/60">
          🎟️ your order ticket
        </p>
        <div className="my-3 border-t-2 border-dashed border-cocoa/15" />
        <div className="space-y-3">
          {state.lines.map((line) => (
            <div key={line.itemId} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-bold text-cocoa">{line.name}</p>
                <p className="text-sm text-cocoa/60">
                  {formatMoney(line.price)} each
                </p>
              </div>
              <QuantityStepper
                value={line.quantity}
                onChange={(n) => setQuantity(line.itemId, n)}
                min={0}
              />
              <span className="w-16 text-right font-display font-extrabold text-cocoa">
                {formatMoney(line.price * line.quantity)}
              </span>
              <button
                onClick={() => remove(line.itemId)}
                aria-label={`Remove ${line.name}`}
                className="text-cocoa/40 hover:text-watermelon"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="my-3 border-t-2 border-dashed border-cocoa/15" />
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-extrabold">Total</span>
          <span className="font-display text-2xl font-extrabold text-watermelon">
            {formatMoney(total)}
          </span>
        </div>
        <p className="handw mt-1 text-center text-lg text-cocoa/50">
          💵 pay at pickup — nothing to pay now
        </p>
      </div>

      {/* Pickup time picker */}
      {windows.length > 0 && (
        <div className="mt-6">
          <p className="font-bold text-cocoa">
            Pickup time <span className="text-watermelon">*</span>
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {windows.map((w) => {
              const label = formatWindow(w);
              const selected = pickupWindow === label;
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => setPickupWindow(label)}
                  className={`rounded-2xl border-2 px-4 py-3 font-bold transition ${
                    selected
                      ? "border-watermelon bg-watermelon text-white shadow-md"
                      : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa/30"
                  }`}
                >
                  🕐 {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Your name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sam"
            className="input"
            autoComplete="name"
          />
        </Field>
        <Field label="Instagram handle" hint="So we can confirm your order in DMs">
          <div className="flex items-center rounded-2xl border-2 border-cocoa/15 bg-white pl-3 focus-within:border-blueberry">
            <span className="text-cocoa/50">@</span>
            <input
              value={igHandle}
              onChange={(e) => setIgHandle(e.target.value)}
              placeholder="yourhandle"
              className="w-full bg-transparent px-2 py-3 outline-none"
            />
          </div>
        </Field>
        <Field label="Phone or email" hint="Optional — another way to reach you">
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Optional"
            className="input"
          />
        </Field>
        <Field label="Notes" hint="Allergies, special requests, pickup time…">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            rows={2}
            className="input resize-none"
          />
        </Field>

        {error && (
          <p className="rounded-2xl bg-watermelon/10 px-4 py-3 text-center font-semibold text-watermelon">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !ordersOpen}
          className="w-full rounded-full bg-watermelon px-6 py-4 font-display text-xl font-extrabold text-white shadow-lg transition hover:brightness-105 disabled:opacity-50"
        >
          {!ordersOpen
            ? "Preorders are closed"
            : submitting
              ? "Placing order…"
              : "Place preorder 🎉"}
        </button>
        <p className="text-center text-xs text-cocoa/50">
          Next you&apos;ll send your order to us on Instagram to confirm.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-bold text-cocoa">
        {label}
        {required && <span className="text-watermelon"> *</span>}
      </span>
      {hint && <span className="ml-2 text-sm text-cocoa/50">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}
