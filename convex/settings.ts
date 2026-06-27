import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";
import { pickupWindowValidator } from "./schema";

// Shop's default pickup windows until the owner changes them.
const DEFAULT_PICKUP_WINDOWS = [
  { start: "11:00", end: "13:00" },
  { start: "16:00", end: "18:00" },
];

// Get the single settings row, creating it with defaults if missing.
async function getOrCreateSettings(ctx: MutationCtx) {
  const row = await ctx.db.query("settings").first();
  if (row) return row;
  const id = await ctx.db.insert("settings", { acceptingPreorders: true });
  return (await ctx.db.get(id))!;
}

// ---- Public ----

// Drives the public banner, whether ordering is enabled, and pickup windows.
export const getStoreStatus = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("settings").first();
    return {
      acceptingPreorders: row?.acceptingPreorders ?? true,
      closedMessage: row?.closedMessage,
      pickupWindows: row?.pickupWindows ?? DEFAULT_PICKUP_WINDOWS,
      cutoffTime: row?.cutoffTime ?? "18:00",
      cutoffDaysBefore: row?.cutoffDaysBefore ?? 1,
    };
  },
});

// ---- Admin ----

// The "close / open preorders" switch the owner flips.
export const setAcceptingPreorders = mutation({
  args: {
    accepting: v.boolean(),
    closedMessage: v.optional(v.string()),
  },
  handler: async (ctx, { accepting, closedMessage }) => {
    await requireAdmin(ctx);
    const row = await getOrCreateSettings(ctx);
    await ctx.db.patch(row._id, {
      acceptingPreorders: accepting,
      closedMessage,
    });
  },
});

// Edit the shop's pickup windows.
export const setPickupWindows = mutation({
  args: { windows: v.array(pickupWindowValidator) },
  handler: async (ctx, { windows }) => {
    await requireAdmin(ctx);
    // Basic sanity: each window's start must be before its end.
    for (const w of windows) {
      if (w.start >= w.end) {
        throw new Error("Each pickup window must start before it ends.");
      }
    }
    const row = await getOrCreateSettings(ctx);
    await ctx.db.patch(row._id, { pickupWindows: windows });
  },
});

// Edit the ordering cutoff (e.g. close ordering at 6pm the day before).
export const setOrderCutoff = mutation({
  args: { cutoffTime: v.string(), cutoffDaysBefore: v.number() },
  handler: async (ctx, { cutoffTime, cutoffDaysBefore }) => {
    await requireAdmin(ctx);
    if (cutoffDaysBefore < 0 || !Number.isInteger(cutoffDaysBefore)) {
      throw new Error("Days before pickup must be a whole number (0 or more).");
    }
    const row = await getOrCreateSettings(ctx);
    await ctx.db.patch(row._id, { cutoffTime, cutoffDaysBefore });
  },
});
