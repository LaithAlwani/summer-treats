"use client";

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-full border-2 border-cocoa/15 bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="grid h-11 w-11 place-items-center rounded-full text-2xl font-bold text-cocoa disabled:opacity-30"
      >
        −
      </button>
      <span className="w-8 text-center font-display text-lg font-extrabold">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="grid h-11 w-11 place-items-center rounded-full text-2xl font-bold text-cocoa disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
