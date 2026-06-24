import { KITCHEN_DISCLAIMER } from "@/lib/allergens";
import { igProfileUrl } from "@/lib/format";

const IG = process.env.NEXT_PUBLIC_IG_USERNAME ?? "summertreatskids";

export function SiteFooter() {
  return (
    <footer className="mt-12">
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="mx-auto max-w-lg rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          ⚠️ {KITCHEN_DISCLAIMER}
        </p>
        <p className="handw mt-5 text-2xl text-cocoa">
          Come say hi on Instagram!
        </p>
        <a
          href={igProfileUrl(IG)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block rounded-full bg-grape px-5 py-2 font-bold text-white shadow-md hover:brightness-105"
        >
          @{IG}
        </a>
        <p className="handw mt-5 text-lg text-cocoa/50">
          made with ☀️ + sprinkles by the Summer Treats kids
        </p>
      </div>
    </footer>
  );
}
