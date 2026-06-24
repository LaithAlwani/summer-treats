"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// The "we're (not) taking preorders" switch on the admin dashboard.
export function PreordersSwitch() {
  const status = useQuery(api.settings.getStoreStatus, {});
  const setAccepting = useMutation(api.settings.setAcceptingPreorders);

  // `draft` is null until the owner edits; until then we show the saved value.
  const [draft, setDraft] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);

  if (status === undefined) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-cocoa/50">Loading store status…</p>
      </div>
    );
  }

  const open = status.acceptingPreorders;
  const message = draft ?? status.closedMessage ?? "";

  async function toggle() {
    await setAccepting({
      accepting: !open,
      closedMessage: message || undefined,
    });
  }

  async function saveMessage() {
    await setAccepting({ accepting: open, closedMessage: message || undefined });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1500);
  }

  return (
    <div
      className={`rounded-2xl border-4 p-5 shadow-sm transition ${
        open ? "border-mint bg-white" : "border-watermelon/40 bg-watermelon/5"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl font-extrabold text-cocoa">
            {open ? "🟢 Taking preorders" : "🔴 Preorders paused"}
          </p>
          <p className="text-sm text-cocoa/60">
            {open
              ? "Customers can place orders right now."
              : "Customers can browse but can't order."}
          </p>
        </div>
        <button
          onClick={toggle}
          className={`rounded-full px-5 py-3 font-display font-bold text-white shadow-md transition hover:brightness-105 ${
            open ? "bg-watermelon" : "bg-mint text-emerald-900!"
          }`}
        >
          {open ? "Pause preorders" : "Start taking preorders"}
        </button>
      </div>

      <div className="mt-4">
        <label className="text-sm font-bold text-cocoa/70">
          Message shown when paused
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            value={message}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Sold out this week — back Monday! 🍪"
            className="input flex-1"
          />
          <button
            onClick={saveMessage}
            className="rounded-full border-2 border-cocoa/15 px-4 py-2 text-sm font-bold text-cocoa hover:border-cocoa/30"
          >
            {savedMsg ? "Saved ✓" : "Save message"}
          </button>
        </div>
      </div>
    </div>
  );
}
