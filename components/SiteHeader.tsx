import Link from "next/link";
import Image from "next/image";
import { igProfileUrl } from "@/lib/format";
import { Awning } from "./Awning";

const IG = process.env.NEXT_PUBLIC_IG_USERNAME ?? "summertreatskids";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-cream">
      <Awning />
      <div className="bg-cream">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-2">
          <Link href="/" className="group flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Summer Treats logo"
              width={48}
              height={48}
              priority
              className="h-11 w-11 object-contain transition group-hover:-rotate-3"
            />
            <span className="leading-none">
              <span className="block font-display text-2xl font-extrabold text-watermelon">
                Summer Treats
              </span>
              <span className="handw block text-sm text-blueberry">
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
