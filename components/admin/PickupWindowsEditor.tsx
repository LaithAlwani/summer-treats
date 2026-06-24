"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatWindow, PickupWindow } from "@/lib/time";

// Edit the shop's pickup time windows (default 11–1 and 4–6).
export function PickupWindowsEditor() {
  const status = useQuery(api.settings.getStoreStatus, {});
  const save = useMutation(api.settings.setPickupWindows);

  // `draft` is null until the owner edits; until then show the saved windows.
  const [draft, setDraft] = useState<PickupWindow[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === undefined) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-cocoa/50">Loading pickup times…</p>
      </div>
    );
  }

  const windows = draft ?? status.pickupWindows;

  function update(i: number, field: "start" | "end", value: string) {
    setDraft(
      windows.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)),
    );
  }
  function addWindow() {
    setDraft([...windows, { start: "11:00", end: "13:00" }]);
  }
  function removeWindow(i: number) {
    setDraft(windows.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setError(null);
    try {
      await save({ windows });
      setSaved(true);
      setDraft(null);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="font-display text-xl font-extrabold text-cocoa">
        🕐 Pickup times
      </p>
      <p className="text-sm text-cocoa/60">
        When customers can pick up. They&apos;ll choose one of these at checkout.
      </p>

      <div className="mt-3 space-y-2">
        {windows.map((w, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              type="time"
              value={w.start}
              onChange={(e) => update(i, "start", e.target.value)}
              className="input max-w-[8rem]"
            />
            <span className="font-bold text-cocoa/50">to</span>
            <input
              type="time"
              value={w.end}
              onChange={(e) => update(i, "end", e.target.value)}
              className="input max-w-[8rem]"
            />
            <span className="text-sm text-cocoa/50">{formatWindow(w)}</span>
            <button
              onClick={() => removeWindow(i)}
              aria-label="Remove time window"
              className="ml-auto text-cocoa/40 hover:text-watermelon"
            >
              ✕
            </button>
          </div>
        ))}
        {windows.length === 0 && (
          <p className="text-sm text-cocoa/50">
            No pickup times — customers won&apos;t be asked to pick one.
          </p>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-xl bg-watermelon/10 px-3 py-2 text-sm font-semibold text-watermelon">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={addWindow}
          className="rounded-full border-2 border-cocoa/15 px-4 py-2 text-sm font-bold text-cocoa hover:border-cocoa/30"
        >
          + Add time window
        </button>
        <button
          onClick={handleSave}
          disabled={draft === null}
          className="rounded-full bg-blueberry px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50"
        >
          {saved ? "Saved ✓" : "Save times"}
        </button>
      </div>
    </div>
  );
}
