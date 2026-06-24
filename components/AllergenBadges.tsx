import { allergenInfo } from "@/lib/allergens";

// Warning-colored "Contains" badges. Amber border keeps them legible and
// clearly cautionary against the bright theme.
export function AllergenBadges({
  allergens,
  showLabel = false,
}: {
  allergens: string[];
  showLabel?: boolean;
}) {
  if (allergens.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
        ✓ No listed allergens
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {showLabel && (
        <span className="text-sm font-bold text-amber-700">Contains:</span>
      )}
      {allergens.map((a) => {
        const info = allergenInfo(a);
        return (
          <span
            key={a}
            className="inline-flex items-center gap-1 rounded-full border-2 border-amber-400 bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-800"
            title={`Contains ${info.label}`}
          >
            <span aria-hidden>{info.emoji}</span>
            {info.label}
          </span>
        );
      })}
    </div>
  );
}
