"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatTime } from "@/lib/time";

// Set when ordering closes (default: 6pm the day before pickup).
export function OrderCutoffEditor() {
  const status = useQuery(api.settings.getStoreStatus, {});
  const save = useMutation(api.settings.setOrderCutoff);

  const [time, setTime] = useState<string | null>(null);
  const [days, setDays] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === undefined) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-cocoa/50">Loading ordering cutoff…</p>
      </div>
    );
  }

  const cutoffTime = time ?? status.cutoffTime;
  const cutoffDays = days ?? String(status.cutoffDaysBefore);
  const daysNum = Number(cutoffDays);

  async function handleSave() {
    setError(null);
    try {
      await save({ cutoffTime, cutoffDaysBefore: Number(cutoffDays) });
      setSaved(true);
      setTime(null);
      setDays(null);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="font-display text-xl font-extrabold text-cocoa">
        ⏰ Ordering cutoff
      </p>
      <p className="text-sm text-cocoa/60">
        How late customers can order for a given day.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm font-bold text-cocoa/70">
          Closes at
          <input
            type="time"
            value={cutoffTime}
            onChange={(e) => setTime(e.target.value)}
            className="input mt-1 max-w-[8rem]"
          />
        </label>
        <label className="text-sm font-bold text-cocoa/70">
          Days before pickup
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={cutoffDays}
            onChange={(e) => setDays(e.target.value)}
            className="input mt-1 max-w-20"
          />
        </label>
        <button
          onClick={handleSave}
          className="rounded-full bg-blueberry px-5 py-2 text-sm font-bold text-white shadow-md"
        >
          {saved ? "Saved ✓" : "Save cutoff"}
        </button>
      </div>

      <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-sm text-cocoa/70">
        {Number.isFinite(daysNum) && daysNum > 0
          ? `Orders for a day close at ${formatTime(cutoffTime)}, ${daysNum} day${daysNum === 1 ? "" : "s"} before. No same-day orders.`
          : `Orders for a day close at ${formatTime(cutoffTime)} that same morning.`}
      </p>

      {error && (
        <p className="mt-2 rounded-xl bg-watermelon/10 px-3 py-2 text-sm font-semibold text-watermelon">
          {error}
        </p>
      )}
    </div>
  );
}
