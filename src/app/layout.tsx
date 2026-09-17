import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import { auth } from "@/auth";
import { CartProvider } from "@/components/cart/cart-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StockFlow",
    template: "%s | StockFlow",
  },
  description:
    "A clear, dependable workspace for inventory, suppliers, and customer orders.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth();
  const cartOwnerId =
    session?.user.role === "CUSTOMER" ? session.user.id : null;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider key={cartOwnerId ?? "guest"} ownerId={cartOwnerId}>
          {children}
        </CartProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
