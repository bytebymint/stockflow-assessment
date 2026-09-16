import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";

import { StockFlowLogo } from "@/components/brand/stockflow-logo";
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

const navigation = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#workflow" },
  { label: "For every role", href: "#roles" },
];

export function PublicHeader() {
  return (
    <header className="border-border/70 bg-background/90 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <StockFlowLogo className="shrink-0" />

        <nav
          className="hidden items-center gap-1 md:flex"
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

        <div className="hidden md:block">
          <Link
            href="/ui-preview"
            className={cn(buttonVariants({ size: "sm" }), "group")}
          >
            View UI system
            <ArrowRight
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              data-icon="inline-end"
            />
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
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
                Explore the product foundation and interface system.
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
            <div className="mt-auto border-t p-4">
              <Link
                href="/ui-preview"
                className={cn(buttonVariants(), "w-full")}
              >
                View UI system
                <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
