"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatMoney } from "@/lib/format";
import { categoryInfo } from "@/lib/allergens";
import { AllergenBadges } from "@/components/AllergenBadges";
import { ItemForm, EditableItem } from "@/components/admin/ItemForm";

export default function AdminItemsPage() {
  const items = useQuery(api.items.list, { includeInactive: true });
  const setActive = useMutation(api.items.setActive);
  const [editing, setEditing] = useState<EditableItem | "new" | null>(null);

  if (editing) {
    return (
      <ItemForm
        item={editing === "new" ? undefined : editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-watermelon">Items</h1>
        <button
          onClick={() => setEditing("new")}
          className="rounded-full bg-watermelon px-5 py-3 font-display font-extrabold text-white shadow-md"
        >
          + New item
        </button>
      </div>

      {items === undefined && (
        <p className="py-10 text-center font-semibold text-cocoa/50">Loading…</p>
      )}

      {items !== undefined && items.length === 0 && (
        <div className="rounded-blob bg-white p-10 text-center shadow">
          <p className="text-4xl">🧁</p>
          <p className="mt-2 font-bold text-cocoa">No items yet.</p>
          <p className="text-cocoa/60">
            Add your first treat, then put it on the schedule.
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {items?.map((item) => {
          const cat = categoryInfo(item.category);
          return (
            <div
              key={item._id}
              className={`flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm ${
                item.active ? "" : "opacity-60"
              }`}
            >
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream text-3xl">
                {item.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  cat.emoji
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-cocoa">{item.name}</p>
                  {!item.active && (
                    <span className="rounded-full bg-cocoa/10 px-2 py-0.5 text-xs font-bold text-cocoa/50">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-sm text-cocoa/60">
                  {cat.label} · {formatMoney(item.price)}
                </p>
                <div className="mt-1">
                  <AllergenBadges allergens={item.allergens} />
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <button
                  onClick={() => setEditing(item as EditableItem)}
                  className="rounded-full bg-blueberry px-4 py-1.5 text-sm font-bold text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    setActive({
                      itemId: item._id as Id<"items">,
                      active: !item.active,
                    })
                  }
                  className="rounded-full border-2 border-cocoa/15 px-4 py-1.5 text-sm font-bold text-cocoa"
                >
                  {item.active ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
