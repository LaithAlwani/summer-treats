import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// ---- Shared validators (reused across functions) ----

export const categoryValidator = v.union(
  v.literal("drink"),
  v.literal("baked-good"),
  v.literal("other"),
);

export const allergenValidator = v.union(
  v.literal("nuts"), // tree nuts
  v.literal("peanuts"),
  v.literal("dairy"),
  v.literal("eggs"),
  v.literal("gluten"), // gluten / wheat
  v.literal("soy"),
  v.literal("sesame"),
);

export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("fulfilled"),
  v.literal("cancelled"),
);

export const lineItemValidator = v.object({
  itemId: v.id("items"),
  nameSnapshot: v.string(),
  priceSnapshot: v.number(),
  quantity: v.number(),
});

// A pickup window, times as 24h "HH:MM" (e.g. { start: "11:00", end: "13:00" }).
export const pickupWindowValidator = v.object({
  start: v.string(),
  end: v.string(),
});

export default defineSchema({
  // Admin login (users / authSessions / authAccounts / ...)
  ...authTables,

  // A treat or drink the kids make. Reusable across days.
  items: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(), // dollars, e.g. 2.5
    category: categoryValidator,
    ingredients: v.array(v.string()),
    allergens: v.array(allergenValidator),
    allergenNotes: v.optional(v.string()),
    photoId: v.optional(v.id("_storage")),
    active: v.boolean(),
  }).index("by_active", ["active"]),

  // One row per (date, item) so a day can have multiple items.
  schedule: defineTable({
    date: v.string(), // ISO "YYYY-MM-DD" pickup date
    itemId: v.id("items"),
    soldOut: v.optional(v.boolean()),
  })
    .index("by_date", ["date"])
    .index("by_date_item", ["date", "itemId"]),

  // A customer preorder.
  orders: defineTable({
    customerName: v.string(),
    igHandle: v.optional(v.string()),
    contact: v.optional(v.string()),
    pickupDate: v.string(),
    pickupWindow: v.optional(v.string()), // formatted label, e.g. "11:00 AM – 1:00 PM"
    lineItems: v.array(lineItemValidator),
    notes: v.optional(v.string()),
    total: v.number(),
    status: orderStatusValidator,
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_pickupDate", ["pickupDate"]),

  // Single-row store config the owner controls.
  settings: defineTable({
    acceptingPreorders: v.boolean(),
    closedMessage: v.optional(v.string()),
    pickupWindows: v.optional(v.array(pickupWindowValidator)),
  }),
});
