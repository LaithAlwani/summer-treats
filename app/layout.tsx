import type { Metadata } from "next";
import { Baloo_2, Nunito, Gochi_Hand } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

// Handwritten marker face for price tags and little notes.
const gochi = Gochi_Hand({
  variable: "--font-gochi",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Summer Treats 🍪🍹",
  description:
    "Fresh baked goods and refreshing drinks, made by kids. Preorder this week's treats!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="en"
        className={`${baloo.variable} ${nunito.variable} ${gochi.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
