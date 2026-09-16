"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { CircleCheck, Clock3, LoaderCircle, ShieldX } from "lucide-react";
import { toast } from "sonner";

import { updateSupplierStatus } from "@/app/(workspace)/admin/suppliers/actions";
import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SupplierStatus } from "@/generated/prisma/client";
import { initialSupplierDecisionState } from "@/lib/suppliers/form-state";

const decisionConfig = {
  APPROVED: {
    label: "Approve",
    pendingLabel: "Approving…",
    title: "Approve supplier",
    description:
      "Approval unlocks the supplier workspace and allows active products to appear publicly.",
    icon: CircleCheck,
    variant: "default" as const,
  },
  PENDING: {
    label: "Return to review",
    pendingLabel: "Updating…",
    title: "Return supplier to review",
    description:
      "The supplier will lose listing access until an administrator records a new decision.",
    icon: Clock3,
    variant: "outline" as const,
  },
  REJECTED: {
    label: "Reject",
    pendingLabel: "Rejecting…",
    title: "Reject supplier",
    description:
      "The supplier will not be able to list products, and existing products will leave the public catalog.",
    icon: ShieldX,
    variant: "destructive" as const,
  },
};

type SupplierStatusDialogProps = {
  supplier: {
    id: string;
    name: string;
    email: string;
  };
  targetStatus: SupplierStatus;
  label?: string;
};

function SupplierDecisionForm({
  supplier,
  targetStatus,
  onSuccess,
}: SupplierStatusDialogProps & { onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState(
    updateSupplierStatus,
    initialSupplierDecisionState,
  );
  const config = decisionConfig[targetStatus];
  const Icon = config.icon;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Supplier status updated");
      onSuccess();
    }
  }, [onSuccess, state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="supplierId" value={supplier.id} />
      <input type="hidden" name="targetStatus" value={targetStatus} />

      <FormAlert
        message={state.status === "error" ? state.message : undefined}
      />

      <div className="border-border bg-muted/45 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <span className="bg-background flex size-10 shrink-0 items-center justify-center rounded-lg border">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold break-words">{supplier.name}</p>
            <p className="text-muted-foreground mt-1 text-sm break-all">
              {supplier.email}
            </p>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor={`decision-note-${supplier.id}-${targetStatus}`}>
          Decision note{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={`decision-note-${supplier.id}-${targetStatus}`}
          name="note"
          className="mt-2"
          rows={3}
          maxLength={300}
          disabled={isPending}
          placeholder="Add concise context for the supplier."
        />
        <p className="text-muted-foreground mt-1.5 text-xs leading-5">
          This note is included in the supplier&apos;s status notification.
        </p>
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={isPending} />}>
          Cancel
        </DialogClose>
        <Button type="submit" variant={config.variant} disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              {config.pendingLabel}
            </>
          ) : (
            <>
              <Icon data-icon="inline-start" aria-hidden="true" />
              Confirm {config.label.toLowerCase()}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function SupplierStatusDialog({
  supplier,
  targetStatus,
  label,
}: SupplierStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);
  const config = decisionConfig[targetStatus];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={config.variant} size="sm" />}>
        <Icon data-icon="inline-start" aria-hidden="true" />
        {label ?? config.label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <SupplierDecisionForm
          key={open ? "open" : "closed"}
          supplier={supplier}
          targetStatus={targetStatus}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

export function SupplierDecisionActions({
  supplier,
  status,
}: {
  supplier: SupplierStatusDialogProps["supplier"];
  status: SupplierStatus;
}) {
  if (status === "PENDING") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
        <SupplierStatusDialog supplier={supplier} targetStatus="REJECTED" />
        <SupplierStatusDialog supplier={supplier} targetStatus="APPROVED" />
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
        <SupplierStatusDialog
          supplier={supplier}
          targetStatus="PENDING"
          label="Review again"
        />
        <SupplierStatusDialog
          supplier={supplier}
          targetStatus="REJECTED"
          label="Revoke"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
      <SupplierStatusDialog
        supplier={supplier}
        targetStatus="PENDING"
        label="Reopen"
      />
      <SupplierStatusDialog supplier={supplier} targetStatus="APPROVED" />
    </div>
  );
}
