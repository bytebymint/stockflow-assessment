import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Database, KeyRound, ShieldCheck } from "lucide-react";

import type { CurrentUser } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

type WorkspaceEntryProps = {
  user: CurrentUser;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  nextStep: string;
};

export function WorkspaceEntry({
  user,
  eyebrow,
  title,
  description,
  icon: Icon,
  nextStep,
}: WorkspaceEntryProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">Access confirmed</h2>
                  <StatusBadge label="Signed in" variant="success" />
                </div>
                <p className="text-muted-foreground mt-2 leading-6">
                  StockFlow matched your account to the correct protected
                  workspace.
                </p>
              </div>
            </div>

            <dl className="border-border/80 divide-border/80 divide-y rounded-xl border">
              <div className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr] sm:items-center">
                <dt className="text-muted-foreground text-sm">Account</dt>
                <dd className="font-medium">{user.name}</dd>
              </div>
              <div className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr] sm:items-center">
                <dt className="text-muted-foreground text-sm">Email</dt>
                <dd className="min-w-0 font-medium break-words">
                  {user.email}
                </dd>
              </div>
              <div className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr] sm:items-center">
                <dt className="text-muted-foreground text-sm">Role</dt>
                <dd className="font-medium capitalize">
                  {user.role.toLowerCase()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="bg-sidebar text-sidebar-foreground border-sidebar-border">
          <CardContent>
            <span className="bg-sidebar-accent text-sidebar-primary flex size-10 items-center justify-center rounded-lg">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-white">
              Protection is active
            </h2>
            <ul className="mt-4 space-y-4 text-sm leading-6">
              <li className="flex gap-3">
                <KeyRound
                  className="text-sidebar-primary mt-1 size-4 shrink-0"
                  aria-hidden="true"
                />
                Passwords are stored as one-way hashes.
              </li>
              <li className="flex gap-3">
                <Database
                  className="text-sidebar-primary mt-1 size-4 shrink-0"
                  aria-hidden="true"
                />
                Protected pages re-check your current database role.
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  className="text-sidebar-primary mt-1 size-4 shrink-0"
                  aria-hidden="true"
                />
                {nextStep}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
