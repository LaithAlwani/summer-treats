import { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartBar } from "@/components/CartBar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <CartBar />
      <SiteFooter />
    </CartProvider>
  );
}
