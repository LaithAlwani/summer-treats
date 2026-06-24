import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { categoryValidator, allergenValidator } from "./schema";
import { requireAdmin } from "./helpers";

// Attach a resolved photo URL to an item document.
async function withPhotoUrl(ctx: QueryCtx, item: Doc<"items">) {
  const photoUrl = item.photoId ? await ctx.storage.getUrl(item.photoId) : null;
  return { ...item, photoUrl };
}

// ---- Public ----

export const getById = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.db.get(itemId);
    if (!item || !item.active) return null;
    return withPhotoUrl(ctx, item);
  },
});

// ---- Admin ----

export const list = query({
  args: { includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, { includeInactive }) => {
    await requireAdmin(ctx);
    const items = includeInactive
      ? await ctx.db.query("items").collect()
      : await ctx.db
          .query("items")
          .withIndex("by_active", (q) => q.eq("active", true))
          .collect();
    items.sort((a, b) => a.name.localeCompare(b.name));
    return Promise.all(items.map((item) => withPhotoUrl(ctx, item)));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: categoryValidator,
    ingredients: v.array(v.string()),
    allergens: v.array(allergenValidator),
    allergenNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("items", { ...args, active: true });
  },
});

export const update = mutation({
  args: {
    itemId: v.id("items"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: categoryValidator,
    ingredients: v.array(v.string()),
    allergens: v.array(allergenValidator),
    allergenNotes: v.optional(v.string()),
  },
  handler: async (ctx, { itemId, ...fields }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(itemId, fields);
  },
});

export const setActive = mutation({
  args: { itemId: v.id("items"), active: v.boolean() },
  handler: async (ctx, { itemId, active }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(itemId, { active });
  },
});

// Step 1 of the photo upload flow: hand the client a short-lived upload URL.
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// Step 3: save the storage id returned by the upload.
export const setPhoto = mutation({
  args: { itemId: v.id("items"), storageId: v.id("_storage") },
  handler: async (ctx, { itemId, storageId }) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(itemId);
    if (item?.photoId) {
      await ctx.storage.delete(item.photoId as Id<"_storage">);
    }
    await ctx.db.patch(itemId, { photoId: storageId });
  },
});
