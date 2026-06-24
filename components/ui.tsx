import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-watermelon text-white hover:brightness-105 shadow-md",
  secondary: "bg-blueberry text-white hover:brightness-105 shadow-md",
  ghost: "bg-white text-cocoa border-2 border-cocoa/15 hover:border-cocoa/30",
  danger: "bg-white text-watermelon border-2 border-watermelon/40 hover:bg-watermelon/10",
};

// Shared button styling, reusable for <button> and <Link>.
export function buttonClasses(variant: Variant = "primary", extra = ""): string {
  return `inline-flex items-center justify-center gap-2 rounded-full px-6 min-h-12 font-display font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  return (
    <button className={buttonClasses(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-blob bg-white shadow-[0_8px_0_0_rgba(74,59,50,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${className}`}
    >
      {children}
    </span>
  );
}
