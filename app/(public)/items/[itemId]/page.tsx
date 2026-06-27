"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { prettyDate } from "@/lib/dates";
import { DEFAULT_CUTOFF, isOrderingOpenForDate, cutoffLabel } from "@/lib/cutoff";
import { categoryInfo, KITCHEN_DISCLAIMER } from "@/lib/allergens";
import { AllergenBadges } from "@/components/AllergenBadges";
import { QuantityStepper } from "@/components/QuantityStepper";

export default function ItemDetailPage() {
  const params = useParams();
  const search = useSearchParams();
  const itemId = params.itemId as Id<"items">;
  const date = search.get("date");

  const item = useQuery(api.items.getById, { itemId });
  const status = useQuery(api.settings.getStoreStatus, {});
  const cutoff = status
    ? { time: status.cutoffTime, daysBefore: status.cutoffDaysBefore }
    : DEFAULT_CUTOFF;
  const dayOpen =
    !!date &&
    (status?.acceptingPreorders ?? true) &&
    isOrderingOpenForDate(date, cutoff);
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (item === undefined) {
    return (
      <p className="py-16 text-center text-lg font-semibold text-cocoa/50">
        Loading… 🍪
      </p>
    );
  }

  if (item === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-4xl">🤔</p>
        <p className="mt-3 text-xl font-bold">This treat isn&apos;t available.</p>
        <Link href="/" className="mt-4 inline-block font-bold text-grape underline">
          ← Back to the menu
        </Link>
      </div>
    );
  }

  const cat = categoryInfo(item.category);

  function handleAdd() {
    if (!date) return;
    add(date, { itemId: item!._id, name: item!.name, price: item!.price }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/" className="handw text-lg text-grape underline">
        ← back to the menu
      </Link>

      <div className="paper mt-4 rounded-blob">
        <div className="flex justify-center pt-3">
          <span className="tag-hole" />
        </div>
        <div className="px-3">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-cream">
            {item.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.photoUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-7xl">
                {cat.emoji}
              </div>
            )}
            <span className="handw absolute -bottom-1 right-3 rotate-3 rounded-lg bg-sunshine px-4 py-1 text-2xl text-cocoa shadow-md">
              {formatMoney(item.price)}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <span className="handw text-lg text-grape">
              {cat.emoji} {cat.label}
            </span>
            <h1 className="text-4xl text-cocoa">{item.name}</h1>
          </div>

          {item.description && (
            <p className="text-cocoa/80">{item.description}</p>
          )}

          {/* Ingredients */}
          <div>
            <h2 className="text-lg text-blueberry">Ingredients</h2>
            {item.ingredients.length > 0 ? (
              <ul className="mt-1 list-inside list-disc text-cocoa/80">
                {item.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-cocoa/50">Not listed.</p>
            )}
          </div>

          {/* Allergy info */}
          <div className="rounded-2xl bg-amber-50 p-4">
            <h2 className="text-lg text-amber-800">⚠️ Allergy info</h2>
            <div className="mt-2">
              <AllergenBadges allergens={item.allergens} showLabel />
            </div>
            {item.allergenNotes && (
              <p className="mt-2 text-sm font-semibold text-amber-800">
                {item.allergenNotes}
              </p>
            )}
            <p className="mt-2 text-sm text-amber-700">{KITCHEN_DISCLAIMER}</p>
          </div>

          {/* Add to order */}
          {date ? (
            <div className="border-t-2 border-cocoa/10 pt-5">
              <p className="mb-2 text-sm font-semibold text-cocoa/60">
                Pickup {prettyDate(date)}
              </p>
              {dayOpen ? (
                <div className="flex items-center gap-3">
                  <QuantityStepper value={qty} onChange={setQty} min={1} />
                  <button
                    onClick={handleAdd}
                    className="flex-1 rounded-full bg-mint px-5 py-3 font-display text-lg font-bold text-emerald-900 shadow-md transition hover:brightness-105"
                  >
                    {added ? "Added! ✓" : `Add ${qty} to order +`}
                  </button>
                </div>
              ) : (
                <p className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center font-semibold text-amber-800">
                  ⏰ Ordering for this day closed at {cutoffLabel(date, cutoff)}.
                </p>
              )}
            </div>
          ) : (
            <div className="border-t-2 border-cocoa/10 pt-5 text-center">
              <Link href="/" className="font-bold text-grape underline">
                Choose a day on the menu to order this →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
