"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { todayISO, prettyDateLong, weekdayShort } from "@/lib/dates";
import {
  DEFAULT_CUTOFF,
  isOrderingOpenForDate,
  cutoffLabel,
} from "@/lib/cutoff";
import { ItemCard } from "@/components/ItemCard";
import { ClosedBanner } from "@/components/ClosedBanner";

export default function HomePage() {
  const startDate = todayISO();
  const week = useQuery(api.schedule.getWeekMenu, { startDate });
  const status = useQuery(api.settings.getStoreStatus, {});

  const acceptingPreorders = status?.acceptingPreorders ?? true;
  const cutoff = status
    ? { time: status.cutoffTime, daysBefore: status.cutoffDaysBefore }
    : DEFAULT_CUTOFF;
  const loading = week === undefined || status === undefined;
  const daysWithItems = (week ?? []).filter((d) => d.items.length > 0);

  const [picked, setPicked] = useState<string | null>(null);
  const selectedDate =
    picked && daysWithItems.some((d) => d.date === picked)
      ? picked
      : daysWithItems[0]?.date;
  const selectedDay = daysWithItems.find((d) => d.date === selectedDate);

  // A day is orderable if the shop is accepting orders AND we're before its cutoff.
  const dayOpen = (date: string) =>
    acceptingPreorders && isOrderingOpenForDate(date, cutoff);
  const selectedOpen = selectedDate ? dayOpen(selectedDate) : false;

  return (
    <div>
      {/* Hero — the logo front and center */}
      <section className="relative overflow-hidden">
        <div className="sprinkles absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 pb-5 pt-6 text-center">
          <h1 className="sr-only">Summer Treats</h1>
          <Image
            src="/logo.png"
            alt="Summer Treats — lemonade and treats"
            width={360}
            height={360}
            priority
            className="mx-auto h-auto w-56 sm:w-72"
          />
          <p className="handw mx-auto -mt-1 max-w-md text-xl text-blueberry">
            Pick a day, add your favorites, and send us your order on Instagram —
            a new menu every day!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4">
        {!acceptingPreorders && <ClosedBanner message={status?.closedMessage} />}

        {loading && (
          <p className="handw py-16 text-center text-2xl text-cocoa/50">
            Setting up the stand… 🍪
          </p>
        )}

        {!loading && daysWithItems.length === 0 && (
          <div className="paper rounded-blob p-10 text-center">
            <p className="text-5xl" aria-hidden>
              🧺
            </p>
            <p className="mt-3 text-2xl text-cocoa">The stand is being stocked</p>
            <p className="handw mt-1 text-xl text-cocoa/60">
              No treats up yet — check back soon!
            </p>
          </div>
        )}

        {!loading && daysWithItems.length > 0 && selectedDay && (
          <>
            {/* Day tags */}
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {daysWithItems.map((day) => {
                const isToday = day.date === startDate;
                const active = day.date === selectedDate;
                const closed = !dayOpen(day.date);
                return (
                  <button
                    key={day.date}
                    onClick={() => setPicked(day.date)}
                    className={`flex shrink-0 flex-col items-center rounded-2xl border-2 px-5 py-2 transition ${
                      active
                        ? "border-watermelon bg-watermelon text-white shadow-md"
                        : "border-cocoa/10 bg-white text-cocoa hover:border-cocoa/25"
                    } ${closed && !active ? "opacity-55" : ""}`}
                  >
                    <span
                      className={`mb-1 h-2.5 w-2.5 rounded-full ${
                        active ? "bg-white/70" : closed ? "bg-cocoa/15" : "bg-mint"
                      }`}
                    />
                    <span className="handw text-lg leading-none">
                      {isToday ? "Today" : weekdayShort(day.date)}
                    </span>
                    <span className="font-display text-xl font-extrabold leading-tight">
                      {selectedDate ? day.date.slice(8) : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected day's menu — pinboard columns */}
            <div className="mb-3 mt-6 flex items-baseline gap-3">
              <h2 className="text-2xl text-blueberry">
                {prettyDateLong(selectedDate!)}
              </h2>
              <span className="handw text-lg text-cocoa/50">
                {selectedDay.items.length} on the table
              </span>
            </div>

            {acceptingPreorders && !selectedOpen && (
              <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center font-semibold text-amber-800">
                ⏰ Ordering for this day closed at{" "}
                {cutoffLabel(selectedDate!, cutoff)}. Pick an upcoming day to
                order!
              </div>
            )}

            <div className="columns-1 gap-5 sm:columns-2">
              {selectedDay.items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  date={selectedDay.date}
                  ordersOpen={selectedOpen}
                />
              ))}
            </div>

            <div className="py-6 text-center">
              <Link
                href="/order"
                className="handw text-xl text-grape underline"
              >
                Review my order →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
