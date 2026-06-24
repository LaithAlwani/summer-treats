// Allergen + category labels shared across the UI. The keys must match the
// literals in convex/schema.ts.

export type Allergen =
  | "nuts"
  | "peanuts"
  | "dairy"
  | "eggs"
  | "gluten"
  | "soy"
  | "sesame";

export const ALLERGENS: { value: Allergen; label: string; emoji: string }[] = [
  { value: "nuts", label: "Tree nuts", emoji: "🌰" },
  { value: "peanuts", label: "Peanuts", emoji: "🥜" },
  { value: "dairy", label: "Dairy", emoji: "🥛" },
  { value: "eggs", label: "Eggs", emoji: "🥚" },
  { value: "gluten", label: "Gluten / Wheat", emoji: "🌾" },
  { value: "soy", label: "Soy", emoji: "🫛" },
  { value: "sesame", label: "Sesame", emoji: "⚪" },
];

const ALLERGEN_MAP = new Map(ALLERGENS.map((a) => [a.value, a]));

export function allergenInfo(value: string) {
  return (
    ALLERGEN_MAP.get(value as Allergen) ?? {
      value,
      label: value,
      emoji: "⚠️",
    }
  );
}

export type Category = "drink" | "baked-good" | "other";

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "drink", label: "Drink", emoji: "🥤" },
  { value: "baked-good", label: "Baked good", emoji: "🍪" },
  { value: "other", label: "Other", emoji: "✨" },
];

export function categoryInfo(value: string) {
  return (
    CATEGORIES.find((c) => c.value === value) ?? {
      value,
      label: value,
      emoji: "✨",
    }
  );
}

// Standing disclaimer shown wherever allergens appear.
export const KITCHEN_DISCLAIMER =
  "Made in a home kitchen that also handles nuts, dairy, eggs, gluten, and other allergens. If you have a severe allergy, please ask us before ordering.";
