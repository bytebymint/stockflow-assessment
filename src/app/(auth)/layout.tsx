import type { ReactNode } from "react";
import { ShieldCheck, ShoppingBag, Store } from "lucide-react";

import { StockFlowLogo } from "@/components/brand/stockflow-logo";

const roles = [
  {
    icon: ShoppingBag,
    title: "Customers",
    description: "Browse publicly; sign in when you’re ready to order.",
  },
  {
    icon: Store,
    title: "Suppliers",
    description: "Apply once, then work from an approved supplier space.",
  },
  {
    icon: ShieldCheck,
    title: "Administrators",
    description: "Use the seeded admin account for protected controls.",
  },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-dvh lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.78fr)]">
      <a
        href="#auth-content"
        className="bg-primary text-primary-foreground shadow-float fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg px-4 py-3 text-sm font-semibold transition-transform focus:translate-y-0"
      >
        Skip to form
      </a>

      <main
        id="auth-content"
        className="flex min-h-dvh min-w-0 flex-col px-4 py-5 sm:px-8 lg:px-12"
      >
        <StockFlowLogo className="w-fit" />
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-10 sm:py-14">
          {children}
        </div>
      </main>

      <aside className="surface-grid border-border/70 bg-sidebar text-sidebar-foreground relative hidden overflow-hidden border-l lg:flex lg:min-h-dvh lg:flex-col lg:justify-center lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,color-mix(in_srgb,var(--sidebar-primary)_18%,transparent),transparent_38%)]" />
        <div className="relative mx-auto w-full max-w-lg">
          <p className="text-sidebar-primary text-xs font-bold tracking-[0.14em] uppercase">
            Secure by role
          </p>
          <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-balance text-white">
            One account. The right workspace.
          </h2>
          <p className="text-sidebar-foreground/75 mt-4 max-w-md leading-7">
            StockFlow keeps public browsing open while protecting ordering and
            operational work behind verified sessions.
          </p>

          <div className="mt-10 space-y-3">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <div
                  key={role.title}
                  className="border-sidebar-border bg-sidebar/70 flex gap-4 rounded-xl border p-4 backdrop-blur-sm"
                >
                  <span className="bg-sidebar-accent text-sidebar-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{role.title}</h3>
                    <p className="text-sidebar-foreground/70 mt-1 text-sm leading-5">
                      {role.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
