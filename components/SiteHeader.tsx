import Link from "next/link";
import { igProfileUrl } from "@/lib/format";
import { Awning } from "./Awning";

const IG = process.env.NEXT_PUBLIC_IG_USERNAME ?? "summertreatskids";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20">
      <Awning />
      <div className="bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-3xl transition group-hover:-rotate-12" aria-hidden>
              🍪
            </span>
            <span className="leading-none">
              <span className="block font-display text-2xl font-extrabold text-watermelon">
                Summer Treats
              </span>
              <span className="handw block text-sm text-cocoa/60">
                made fresh by us!
              </span>
            </span>
          </Link>
          <a
            href={igProfileUrl(IG)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-grape px-4 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-105"
          >
            DM @{IG}
          </a>
        </div>
      </div>
    </header>
  );
}
