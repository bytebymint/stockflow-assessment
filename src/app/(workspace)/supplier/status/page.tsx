import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CircleAlert, Clock3, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Supplier account status" };

export default async function SupplierStatusPage() {
  const user = await requireRole("SUPPLIER");

  if (user.supplierStatus === "APPROVED") {
    redirect("/supplier");
  }

  const isRejected = user.supplierStatus === "REJECTED";
  const navigation = [
    { label: "Account status", href: "/supplier/status", icon: Clock3 },
  ];

  return (
    <AppShell
      navigation={navigation}
      activeHref="/supplier/status"
      roleLabel="Supplier applicant"
      userName={user.name}
      userEmail={user.email}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          eyebrow="Supplier application"
          title={
            isRejected ? "Application needs attention" : "Review in progress"
          }
          description={
            isRejected
              ? "This supplier account is not currently approved to list products."
              : "Your account is secure and signed in while an administrator reviews the supplier application."
          }
        />

        <Card>
          <CardContent>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span
                className={
                  isRejected
                    ? "bg-destructive/10 text-destructive flex size-12 shrink-0 items-center justify-center rounded-xl"
                    : "bg-warning-subtle text-warning-foreground flex size-12 shrink-0 items-center justify-center rounded-xl"
                }
              >
                {isRejected ? (
                  <CircleAlert className="size-6" aria-hidden="true" />
                ) : (
                  <Clock3 className="size-6" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <StatusBadge
                    label={isRejected ? "Not approved" : "Pending review"}
                    variant={isRejected ? "destructive" : "warning"}
                  />
                </div>
                <p className="text-muted-foreground mt-3 leading-6">
                  {isRejected
                    ? "Product listing remains unavailable. The supplier-review workflow added in Step 8 will provide the next action and status notification."
                    : "No action is required right now. Product listing remains unavailable until approval is recorded."}
                </p>
                <div className="border-border/80 bg-muted/50 mt-5 flex gap-3 rounded-lg border p-4 text-sm leading-6">
                  <ShieldCheck
                    className="text-primary mt-1 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <p>
                    Direct links to the approved supplier workspace are blocked
                    on both the route and server data layers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
