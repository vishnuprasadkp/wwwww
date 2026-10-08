import type { Metadata } from "next";
import { Source_Serif_4, Geist, JetBrains_Mono } from "next/font/google";
import { site } from "@/lib/site";
import { getAsset } from "@/lib/assets";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Cursor from "@/components/layout/Cursor";
import ScrollUp from "@/components/layout/ScrollUp";
import { preload } from "react-dom";
import "./globals.css";

// next/font downloads these at build time and serves them from your own domain.
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, type: "website", images: [getAsset("og-default").file] },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preload("/images/site/paper.webp", { as: "image", fetchPriority: "high", media: "(min-width: 1024px)" });
  preload("/images/site/paper-sm.webp", { as: "image", fetchPriority: "high", media: "(max-width: 1023.98px)" });
  return (
    <html lang="en" className={`${serif.variable} ${geist.variable} ${mono.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 bg-pigment text-sand px-3 py-2 text-sm">
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <div className="paper-bg" aria-hidden />
        <Cursor />
        <ScrollUp />
      </body>
    </html>
  );
}
