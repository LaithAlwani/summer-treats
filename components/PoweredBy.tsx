"use client";

import { useState } from "react";

// "Powered by LA Digital" credit in the footer. Shows the logo (from
// /ladigital/logo.png) before the text; if the logo file isn't present it
// degrades to text only — never a broken image.
export function PoweredBy() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <a
      href="https://www.ladigital.ca"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cocoa/50 transition hover:text-cocoa/80"
    >
      {imgOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/La-logo.webp"
          alt="LA Digital"
          className="h-8 w-auto"
          onError={() => setImgOk(false)}
        />
      )}
      <span>Powered by LA Digital</span>
    </a>
  );
}
