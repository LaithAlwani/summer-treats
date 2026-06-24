"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatMoney } from "@/lib/format";
import { prettyDate } from "@/lib/dates";
import { PreordersSwitch } from "@/components/admin/PreordersSwitch";
import { PickupWindowsEditor } from "@/components/admin/PickupWindowsEditor";

type Status = "pending" | "confirmed" | "fulfilled" | "cancelled";

const STATUS_TABS: { value: Status | "all"; label: string }[] = [
  { value: "pending", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "fulfilled", label: "Done" },
  { value: "all", label: "All" },
];

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-sunshine/40 text-amber-800",
  confirmed: "bg-blueberry/20 text-blue-800",
  fulfilled: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-cocoa/10 text-cocoa/50",
};

export default function AdminOrdersPage() {
  const [tab, setTab] = useState<Status | "all">("pending");
  const orders = useQuery(api.orders.listByStatus, {});
  const updateStatus = useMutation(api.orders.updateStatus);

  const filtered =
    orders?.filter((o) => tab === "all" || o.status === tab) ?? [];
  const pendingCount =
    orders?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      <PreordersSwitch />
      <PickupWindowsEditor />

      <div>
        <h1 className="text-3xl text-watermelon">Orders</h1>
        <p className="text-cocoa/60">
          {pendingCount > 0
            ? `${pendingCount} new order${pendingCount === 1 ? "" : "s"} waiting 🎉`
            : "No new orders right now."}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === t.value
                ? "bg-cocoa text-white"
                : "bg-white text-cocoa hover:bg-cocoa/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {orders === undefined && (
        <p className="py-10 text-center font-semibold text-cocoa/50">Loading…</p>
      )}

      {orders !== undefined && filtered.length === 0 && (
        <div className="rounded-blob bg-white p-10 text-center shadow">
          <p className="text-4xl">📭</p>
          <p className="mt-2 font-bold text-cocoa">Nothing here yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((order) => (
          <div
            key={order._id}
            className="rounded-2xl bg-white p-5 shadow-[0_6px_0_0_rgba(74,59,50,0.06)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-xl font-extrabold text-cocoa">
                  {order.customerName}
                </p>
                <p className="text-sm text-cocoa/60">
                  Pickup {prettyDate(order.pickupDate)}
                  {order.pickupWindow && ` · 🕐 ${order.pickupWindow}`}
                  {order.igHandle && (
                    <>
                      {" · "}
                      <a
                        href={`https://ig.me/m/${order.igHandle.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-grape underline"
                      >
                        @{order.igHandle.replace(/^@/, "")}
                      </a>
                    </>
                  )}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLE[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <ul className="mt-3 space-y-1 text-cocoa/80">
              {order.lineItems.map((line, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>
                    {line.quantity}× {line.nameSnapshot}
                  </span>
                  <span className="font-semibold">
                    {formatMoney(line.priceSnapshot * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex justify-between border-t border-cocoa/10 pt-2 font-display font-extrabold">
              <span>Total</span>
              <span className="text-watermelon">{formatMoney(order.total)}</span>
            </div>

            {order.contact && (
              <p className="mt-2 text-sm text-cocoa/60">📞 {order.contact}</p>
            )}
            {order.notes && (
              <p className="mt-1 rounded-xl bg-cream px-3 py-2 text-sm text-cocoa/80">
                📝 {order.notes}
              </p>
            )}

            <OrderActions
              status={order.status}
              onSet={(status) => updateStatus({ orderId: order._id as Id<"orders">, status })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderActions({
  status,
  onSet,
}: {
  status: Status;
  onSet: (status: Status) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {status === "pending" && (
        <button
          onClick={() => onSet("confirmed")}
          className="rounded-full bg-blueberry px-4 py-2 text-sm font-bold text-white"
        >
          ✓ Confirm
        </button>
      )}
      {status === "confirmed" && (
        <button
          onClick={() => onSet("fulfilled")}
          className="rounded-full bg-mint px-4 py-2 text-sm font-bold text-emerald-900"
        >
          🎉 Mark done
        </button>
      )}
      {status === "fulfilled" && (
        <button
          onClick={() => onSet("confirmed")}
          className="rounded-full border-2 border-cocoa/15 px-4 py-2 text-sm font-bold text-cocoa"
        >
          ↩ Reopen
        </button>
      )}
      {status !== "cancelled" && status !== "fulfilled" && (
        <button
          onClick={() => onSet("cancelled")}
          className="rounded-full border-2 border-watermelon/40 px-4 py-2 text-sm font-bold text-watermelon"
        >
          Cancel
        </button>
      )}
      {status === "cancelled" && (
        <button
          onClick={() => onSet("pending")}
          className="rounded-full border-2 border-cocoa/15 px-4 py-2 text-sm font-bold text-cocoa"
        >
          ↩ Restore
        </button>
      )}
    </div>
  );
}
