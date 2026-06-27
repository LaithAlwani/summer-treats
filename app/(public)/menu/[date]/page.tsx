"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { prettyDateLong } from "@/lib/dates";
import { DEFAULT_CUTOFF, isOrderingOpenForDate, cutoffLabel } from "@/lib/cutoff";
import { ItemCard } from "@/components/ItemCard";
import { ClosedBanner } from "@/components/ClosedBanner";

export default function DayMenuPage() {
  const params = useParams();
  const date = params.date as string;

  const items = useQuery(api.schedule.getMenuForDate, { date });
  const status = useQuery(api.settings.getStoreStatus, {});
  const acceptingPreorders = status?.acceptingPreorders ?? true;
  const cutoff = status
    ? { time: status.cutoffTime, daysBefore: status.cutoffDaysBefore }
    : DEFAULT_CUTOFF;
  const dayOpen = isOrderingOpenForDate(date, cutoff);
  const open = acceptingPreorders && dayOpen;
  const loading = items === undefined || status === undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/" className="text-sm font-bold text-grape underline">
        ← All days
      </Link>
      <h1 className="mt-3 text-3xl text-blueberry">{prettyDateLong(date)}</h1>

      <div className="mt-5">
        {!acceptingPreorders && <ClosedBanner message={status?.closedMessage} />}

        {acceptingPreorders && !dayOpen && (
          <div className="mb-5 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center font-semibold text-amber-800">
            ⏰ Ordering for this day closed at {cutoffLabel(date, cutoff)}.
          </div>
        )}

        {loading && (
          <p className="py-16 text-center font-semibold text-cocoa/50">
            Loading… 🍪
          </p>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-blob bg-white p-10 text-center shadow">
            <p className="text-4xl">🧺</p>
            <p className="mt-3 text-xl font-bold">No treats this day.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                date={date}
                ordersOpen={open}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
