"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { prettyDate } from "@/lib/dates";

// Sticky bottom bar summarizing the in-progress order. Hidden when empty.
export function CartBar() {
  const { count, total, state } = useCart();
  if (count === 0) return null;

  return (
    <div className="sticky bottom-0 z-20 px-3 pb-3">
      <Link
        href="/order"
        className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full bg-watermelon px-5 py-3 text-white shadow-lg transition hover:brightness-105"
      >
        <span className="flex items-center gap-2 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm">
            {count}
          </span>
          {state.pickupDate ? `for ${prettyDate(state.pickupDate)}` : "View order"}
        </span>
        <span className="font-display text-lg font-extrabold">
          {formatMoney(total)} →
        </span>
      </Link>
    </div>
  );
}
