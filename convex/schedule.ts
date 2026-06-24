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

// Resolve the active, scheduled items for a single date (with sold-out flag + photo).
async function itemsForDate(ctx: QueryCtx, date: string) {
  const rows = await ctx.db
    .query("schedule")
    .withIndex("by_date", (q) => q.eq("date", date))
    .collect();

  const items = await Promise.all(
    rows.map(async (row) => {
      const item = await ctx.db.get(row.itemId);
      if (!item || !item.active) return null;
      const photoUrl = item.photoId
        ? await ctx.storage.getUrl(item.photoId)
        : null;
      return {
        ...item,
        photoUrl,
        scheduleId: row._id,
        soldOut: row.soldOut ?? false,
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
    return Promise.all(
      rows.map(async (row) => {
        const item = await ctx.db.get(row.itemId);
        return {
          scheduleId: row._id,
          soldOut: row.soldOut ?? false,
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

export const setSoldOut = mutation({
  args: { scheduleId: v.id("schedule"), soldOut: v.boolean() },
  handler: async (ctx, { scheduleId, soldOut }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(scheduleId, { soldOut });
  },
});
