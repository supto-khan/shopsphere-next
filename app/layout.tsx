import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import LoginModal from "@/components/LoginModal";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

import { api } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = "/favicon.png";
  try {
    const config = await api.getConfig();
    if (config && config.company_fav_icon && typeof config.company_fav_icon === 'object' && config.company_fav_icon.path) {
      favicon = config.company_fav_icon.path.replace(/^https?:\/\/[^\/]+/, '');
    }
  } catch (err) {
    console.error("Failed to load metadata configuration", err);
  }

  return {
    title: "ShopSphere - Modern E-Commerce Platform",
    description: "Experience premium, convenient online shopping with ShopSphere.",
    icons: {
      icon: favicon,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-neutral-white" suppressHydrationWarning>
        <Header />
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>
          <CartDrawer />
          <LoginModal />
      </body>
    </html>
  );
}
