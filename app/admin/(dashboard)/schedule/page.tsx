"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { todayISO, addDays, prettyDate, prettyDateLong } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { categoryInfo } from "@/lib/allergens";

export default function AdminSchedulePage() {
  const [date, setDate] = useState(todayISO());

  const assigned = useQuery(api.schedule.listForDate, { date });
  const allItems = useQuery(api.items.list, {});
  const assign = useMutation(api.schedule.assign);
  const unassign = useMutation(api.schedule.unassign);
  const setSoldOut = useMutation(api.schedule.setSoldOut);
  const setLimit = useMutation(api.schedule.setLimit);

  const assignedIds = new Set(
    (assigned ?? []).map((a) => a.item?._id).filter(Boolean),
  );
  const available = (allItems ?? []).filter((i) => !assignedIds.has(i._id));

  const quickDays = Array.from({ length: 7 }, (_, i) => addDays(todayISO(), i));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-watermelon">Schedule</h1>
      <p className="text-cocoa/60">
        Pick a day, then choose which treats are for sale.
      </p>

      {/* Date picker */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickDays.map((d, i) => (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                d === date
                  ? "bg-cocoa text-white"
                  : "bg-white text-cocoa hover:bg-cocoa/5"
              }`}
            >
              {i === 0 ? "Today" : prettyDate(d)}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input max-w-xs"
        />
      </div>

      {/* Assigned items */}
      <section>
        <h2 className="text-xl text-blueberry">
          On the menu for {prettyDateLong(date)}
        </h2>
        <div className="mt-3 space-y-2">
          {assigned === undefined && (
            <p className="text-cocoa/50">Loading…</p>
          )}
          {assigned !== undefined && assigned.length === 0 && (
            <p className="rounded-2xl bg-white p-4 text-cocoa/60 shadow-sm">
              Nothing scheduled yet — add items from below.
            </p>
          )}
          {assigned?.map((row) => (
            <div
              key={row.scheduleId}
              className="rounded-2xl bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {row.item ? categoryInfo(row.item.category).emoji : "❓"}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-cocoa">
                    {row.item?.name ?? "(deleted item)"}
                  </p>
                  {row.item && (
                    <p className="text-sm text-cocoa/60">
                      {formatMoney(row.item.price)}
                      {!row.item.active && " · hidden"}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    setSoldOut({
                      scheduleId: row.scheduleId as Id<"schedule">,
                      soldOut: !row.soldOut,
                    })
                  }
                  className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                    row.soldOut
                      ? "bg-cocoa text-white"
                      : "border-2 border-cocoa/15 text-cocoa"
                  }`}
                >
                  {row.soldOut ? "Sold out" : "In stock"}
                </button>
                <button
                  onClick={() =>
                    unassign({ scheduleId: row.scheduleId as Id<"schedule"> })
                  }
                  aria-label="Remove from day"
                  className="text-cocoa/40 hover:text-watermelon"
                >
                  ✕
                </button>
              </div>

              {/* Daily limit */}
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-cocoa/10 pt-2 text-sm">
                <label className="font-bold text-cocoa/70">Daily limit:</label>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  defaultValue={row.limit ?? ""}
                  placeholder="∞"
                  onBlur={(e) => {
                    const raw = e.target.value.trim();
                    setLimit({
                      scheduleId: row.scheduleId as Id<"schedule">,
                      limit: raw === "" ? null : Number(raw),
                    });
                  }}
                  className="input max-w-20 py-1"
                />
                <span className="text-cocoa/50">
                  {row.orderedQty} ordered
                  {row.limit != null &&
                    ` · ${Math.max(0, row.limit - row.orderedQty)} left`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Available items to add */}
      <section>
        <h2 className="text-xl text-blueberry">Add a treat</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {available.length === 0 && (
            <p className="text-cocoa/50">
              {allItems === undefined
                ? "Loading…"
                : "All your items are already on this day."}
            </p>
          )}
          {available.map((item) => (
            <button
              key={item._id}
              onClick={() =>
                assign({ date, itemId: item._id as Id<"items"> })
              }
              className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition hover:bg-cream"
            >
              <span className="text-2xl">
                {categoryInfo(item.category).emoji}
              </span>
              <span className="flex-1">
                <span className="block font-bold text-cocoa">{item.name}</span>
                <span className="text-sm text-cocoa/60">
                  {formatMoney(item.price)}
                </span>
              </span>
              <span className="font-display text-xl font-extrabold text-emerald-600">
                +
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-cocoa/50">
          Need a new treat?{" "}
          <a href="/admin/items" className="font-bold text-grape underline">
            Create it on the Items page
          </a>{" "}
          first.
        </p>
      </section>
    </div>
  );
}
