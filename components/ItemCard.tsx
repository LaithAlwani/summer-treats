"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { categoryInfo } from "@/lib/allergens";
import { AllergenBadges } from "./AllergenBadges";
import { MenuItem } from "@/lib/types";

export function ItemCard({
  item,
  date,
  ordersOpen,
}: {
  item: MenuItem;
  date: string;
  ordersOpen: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const cat = categoryInfo(item.category);
  const remaining = item.remaining;
  const outByLimit = remaining != null && remaining <= 0;
  const soldOut = item.soldOut || outByLimit;
  const lowStock = remaining != null && remaining > 0 && remaining <= 5;
  const disabled = !ordersOpen || soldOut;

  function handleAdd() {
    add(date, { itemId: item._id, name: item.name, price: item.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="hover-pop paper mb-5 break-inside-avoid rounded-blob">
      {/* Punched hole — this is a tag */}
      <div className="flex justify-center pt-3">
        <span className="tag-hole" />
      </div>

      <Link href={`/items/${item._id}?date=${date}`} className="block px-3">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-cream">
          {item.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photoUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-6xl">
              {cat.emoji}
            </div>
          )}
          <span className="handw absolute left-2 top-2 rounded-full bg-white/90 px-3 py-0.5 text-base text-cocoa shadow">
            {cat.emoji} {cat.label}
          </span>
          {soldOut && (
            <span className="absolute inset-0 grid place-items-center bg-cocoa/55">
              <span className="-rotate-6 rounded-xl bg-white px-4 py-1 font-display text-lg font-extrabold text-watermelon shadow">
                Sold out
              </span>
            </span>
          )}
          {!soldOut && lowStock && (
            <span className="handw absolute left-2 bottom-1 rounded-full bg-watermelon px-3 py-0.5 text-base text-white shadow">
              only {remaining} left!
            </span>
          )}
          {/* Price tag tied to the corner */}
          <span className="handw absolute -bottom-1 right-2 rotate-3 rounded-lg bg-sunshine px-3 py-0.5 text-xl text-cocoa shadow-md">
            {formatMoney(item.price)}
          </span>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <Link href={`/items/${item._id}?date=${date}`}>
          <h3 className="text-xl text-cocoa">{item.name}</h3>
        </Link>

        {item.description && (
          <p className="line-clamp-2 text-sm text-cocoa/70">{item.description}</p>
        )}

        <AllergenBadges allergens={item.allergens} showLabel />

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAdd}
            disabled={disabled}
            className="flex-1 rounded-full bg-mint px-4 py-2.5 font-display font-bold text-emerald-900 shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {soldOut
              ? "Sold out"
              : !ordersOpen
                ? "Closed"
                : added
                  ? "Added! ✓"
                  : "Add to order +"}
          </button>
          <Link
            href={`/items/${item._id}?date=${date}`}
            className="rounded-full border-2 border-cocoa/15 px-4 py-2.5 text-sm font-bold text-cocoa hover:border-cocoa/30"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
