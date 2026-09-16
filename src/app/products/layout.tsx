import type { ReactNode } from "react";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground shadow-float fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg px-4 py-3 text-sm font-semibold transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
