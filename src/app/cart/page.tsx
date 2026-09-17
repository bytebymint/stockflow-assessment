import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CartPageContent } from "@/components/cart/cart-page-content";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { getWorkspacePath } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review saved products and current availability by supplier.",
};

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?returnTo=%2Fcart");
  }

  if (user.role !== "CUSTOMER") {
    redirect(getWorkspacePath(user));
  }

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground shadow-float fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg px-4 py-3 text-sm font-semibold transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <PublicHeader />
      <CartPageContent />
      <PublicFooter />
    </div>
  );
}
