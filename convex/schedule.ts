import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

// Add `days` to an ISO "YYYY-MM-DD" string, returning a new ISO date.
function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Sum already-ordered quantities per item for a date (excludes cancelled).
export async function orderedQtyByItem(ctx: QueryCtx, date: string) {
  const orders = await ctx.db
    .query("orders")
    .withIndex("by_pickupDate", (q) => q.eq("pickupDate", date))
    .collect();
  const map = new Map<string, number>();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const line of order.lineItems) {
      map.set(line.itemId, (map.get(line.itemId) ?? 0) + line.quantity);
    }
  }
  return map;
}

// Resolve the active, scheduled items for a single date (with sold-out flag,
// photo, and remaining count when a daily limit is set).
async function itemsForDate(ctx: QueryCtx, date: string) {
  const rows = await ctx.db
    .query("schedule")
    .withIndex("by_date", (q) => q.eq("date", date))
    .collect();

  const ordered = await orderedQtyByItem(ctx, date);

  const items = await Promise.all(
    rows.map(async (row) => {
      const item = await ctx.db.get(row.itemId);
      if (!item || !item.active) return null;
      const photoUrl = item.photoId
        ? await ctx.storage.getUrl(item.photoId)
        : null;
      const limit = row.limit ?? null;
      const remaining =
        limit === null
          ? null
          : Math.max(0, limit - (ordered.get(row.itemId) ?? 0));
      return {
        ...item,
        photoUrl,
        scheduleId: row._id,
        soldOut: row.soldOut ?? false,
        limit,
        remaining,
      };
    }),
  );

  return items.filter((i): i is NonNullable<typeof i> => i !== null);
}

// ---- Public ----

export const getMenuForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return itemsForDate(ctx, date);
  },
});

export const getWeekMenu = query({
  args: { startDate: v.string() },
  handler: async (ctx, { startDate }) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      days.push({ date, items: await itemsForDate(ctx, date) });
    }
    return days;
  },
});

// ---- Admin ----

// Admin view: every schedule row for a date, including inactive items.
export const listForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("schedule")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
    const ordered = await orderedQtyByItem(ctx, date);
    return Promise.all(
      rows.map(async (row) => {
        const item = await ctx.db.get(row.itemId);
        return {
          scheduleId: row._id,
          soldOut: row.soldOut ?? false,
          limit: row.limit ?? null,
          orderedQty: ordered.get(row.itemId) ?? 0,
          item,
        };
      }),
    );
  },
});

export const assign = mutation({
  args: { date: v.string(), itemId: v.id("items") },
  handler: async (ctx, { date, itemId }) => {
    await requireAdmin(ctx);
    // Avoid duplicate (date, item) rows.
    const existing = await ctx.db
      .query("schedule")
      .withIndex("by_date_item", (q) =>
        q.eq("date", date).eq("itemId", itemId),
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("schedule", { date, itemId });
  },
});

export const unassign = mutation({
  args: { scheduleId: v.id("schedule") },
  handler: async (ctx, { scheduleId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(scheduleId);
  },
});

// Set (or clear) the daily quantity limit for a scheduled item.
export const setLimit = mutation({
  args: {
    scheduleId: v.id("schedule"),
    limit: v.union(v.number(), v.null()),
  },
  handler: async (ctx, { scheduleId, limit }) => {
    await requireAdmin(ctx);
    if (limit !== null && (limit < 0 || !Number.isInteger(limit))) {
      throw new Error("Limit must be a whole number (0 or more).");
    }
    await ctx.db.patch(scheduleId, { limit: limit ?? undefined });
  },
});

export const setSoldOut = mutation({
  args: { scheduleId: v.id("schedule"), soldOut: v.boolean() },
  handler: async (ctx, { scheduleId, soldOut }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(scheduleId, { soldOut });
  },
});
