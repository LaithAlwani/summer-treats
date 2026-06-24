import { Id } from "@/convex/_generated/dataModel";

// Shape of an item as shown on the public menu (item fields + resolved photo
// URL + per-day schedule info).
export type MenuItem = {
  _id: Id<"items">;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  allergens: string[];
  allergenNotes?: string;
  photoUrl: string | null;
  scheduleId?: Id<"schedule">;
  soldOut?: boolean;
};
