import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import LazyModals from "@/components/LazyModals";
import { Analytics } from "@vercel/analytics/next";

// Lexend with font-display: swap so text renders immediately in a fallback font
// while the custom font loads, eliminating Flash of Invisible Text (FOIT).
// adjustFontFallback matches the fallback's metrics to Lexend to prevent CLS.
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

import { api } from "@/lib/api";
import StoreProviderInit from "@/components/StoreProviderInit";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://shopsphere.prosolverhq.com";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = "/favicon.png";
  try {
    const config = await api.getConfig();
    if (
      config &&
      config.company_fav_icon &&
      typeof config.company_fav_icon === "object" &&
      config.company_fav_icon.path
    ) {
      favicon = config.company_fav_icon.path.replace(/^https?:\/\/[^/]+/, "");
    }
  } catch (err) {
    console.error("Failed to load metadata configuration", err);
  }

  return {
    title: "ShopSphere - Modern E-Commerce Platform",
    description:
      "Experience premium, convenient online shopping with ShopSphere.",
    icons: {
      icon: favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let config = null;
  try {
    config = await api.getConfig();
  } catch (err) {
    console.error("Failed to load initial config in RootLayout", err);
  }

  return (
    <html
      lang="en"
      className={`${lexend.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Warm up TCP+TLS to the backend before the first client-side API call */}
        <link rel="preconnect" href={BACKEND_ORIGIN} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={BACKEND_ORIGIN} />
      </head>
      <body
        className="min-h-full flex flex-col bg-neutral-white"
        suppressHydrationWarning
      >
        <StoreProviderInit initialConfig={config} />
        <Header />
        <div className="flex-1 flex overflow-hidden">{children}</div>
        {/* LazyModals is a client component that dynamic-imports CartDrawer and
            LoginModal with ssr:false — keeps both out of the initial JS bundle */}
        <LazyModals />
        <Analytics />
      </body>
    </html>
  );
}
