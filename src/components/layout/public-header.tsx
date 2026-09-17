import Link from "next/link";
import { ArrowRight, LogIn, Menu, UserPlus } from "lucide-react";

import { auth } from "@/auth";
import { StockFlowLogo } from "@/components/brand/stockflow-logo";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getWorkspacePath } from "@/lib/auth/paths";

const navigation = [
  { label: "Catalog", href: "/products" },
  { label: "Platform", href: "/#platform" },
  { label: "How it works", href: "/#workflow" },
  { label: "For every role", href: "/#roles" },
];

export async function PublicHeader() {
  const session = await auth();
  const workspacePath = session?.user
    ? getWorkspacePath(session.user)
    : undefined;

  return (
    <header className="border-border/70 bg-background/90 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <StockFlowLogo className="min-w-0" />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/30 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-200 focus-visible:ring-3 focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user.role === "CUSTOMER" ? <CartDrawer /> : null}

          <div className="hidden items-center gap-2 lg:flex">
            {workspacePath ? (
              <Link
                href={workspacePath}
                className={cn(buttonVariants({ size: "sm" }), "group")}
              >
                Open workspace
                <ArrowRight
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  data-icon="inline-end"
                />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: "sm" }), "group")}
                >
                  Create account
                  <ArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    data-icon="inline-end"
                  />
                </Link>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(22rem,88vw)]">
              <SheetHeader className="border-b">
                <SheetTitle>Navigate StockFlow</SheetTitle>
                <SheetDescription>
                  Explore the platform or access your secure workspace.
                </SheetDescription>
              </SheetHeader>
              <nav
                className="flex flex-col gap-2 px-4"
                aria-label="Mobile navigation"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:bg-muted focus-visible:ring-ring/30 flex min-h-11 items-center rounded-lg px-3 text-base font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto space-y-2 border-t p-4">
                {workspacePath ? (
                  <Link
                    href={workspacePath}
                    className={cn(buttonVariants(), "w-full")}
                  >
                    Open workspace
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full",
                      )}
                    >
                      <LogIn data-icon="inline-start" />
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className={cn(buttonVariants(), "w-full")}
                    >
                      <UserPlus data-icon="inline-start" />
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
