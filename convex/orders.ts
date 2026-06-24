import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { orderStatusValidator } from "./schema";
import { requireAdmin } from "./helpers";

// ---- Public ----

// Create a preorder. The client sends only itemIds + quantities; everything
// price-related is recomputed server-side so totals can't be tampered with.
export const create = mutation({
  args: {
    customerName: v.string(),
    igHandle: v.optional(v.string()),
    contact: v.optional(v.string()),
    pickupDate: v.string(),
    pickupWindow: v.optional(v.string()),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({ itemId: v.id("items"), quantity: v.number() }),
    ),
  },
  handler: async (ctx, args) => {
    // 1. Hard stop if preorders are closed (UI also hides ordering).
    const settings = await ctx.db.query("settings").first();
    if (settings && !settings.acceptingPreorders) {
      throw new Error("Preorders are currently closed.");
    }

    if (args.items.length === 0) {
      throw new Error("Your order is empty.");
    }
    if (args.customerName.trim().length === 0) {
      throw new Error("Please add your name.");
    }

    // 2. Validate each line and build trustworthy snapshots.
    const lineItems = [];
    let total = 0;
    for (const line of args.items) {
      if (line.quantity < 1 || !Number.isInteger(line.quantity)) {
        throw new Error("Invalid quantity.");
      }
      const item = await ctx.db.get(line.itemId);
      if (!item || !item.active) {
        throw new Error("One of the items is no longer available.");
      }
      // Must be scheduled for this pickup date and not sold out.
      const scheduled = await ctx.db
        .query("schedule")
        .withIndex("by_date_item", (q) =>
          q.eq("date", args.pickupDate).eq("itemId", line.itemId),
        )
        .unique();
      if (!scheduled) {
        throw new Error(`${item.name} isn't on the menu for that day.`);
      }
      if (scheduled.soldOut) {
        throw new Error(`Sorry, ${item.name} is sold out.`);
      }
      lineItems.push({
        itemId: item._id,
        nameSnapshot: item.name,
        priceSnapshot: item.price,
        quantity: line.quantity,
      });
      total += item.price * line.quantity;
    }

    // 3. Save. Total is rounded to cents to avoid float drift.
    return await ctx.db.insert("orders", {
      customerName: args.customerName.trim(),
      igHandle: args.igHandle?.trim() || undefined,
      contact: args.contact?.trim() || undefined,
      pickupDate: args.pickupDate,
      pickupWindow: args.pickupWindow?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      lineItems,
      total: Math.round(total * 100) / 100,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Read a single order back (used by the confirmation screen).
export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

// ---- Admin ----

export const listByStatus = query({
  args: { status: v.optional(orderStatusValidator) },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    const orders = status
      ? await ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", status))
          .collect()
      : await ctx.db.query("orders").collect();
    // Newest first.
    orders.sort((a, b) => b.createdAt - a.createdAt);
    return orders;
  },
});

export const updateStatus = mutation({
  args: { orderId: v.id("orders"), status: orderStatusValidator },
  handler: async (ctx, { orderId, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(orderId, { status });
  },
});
