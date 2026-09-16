"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Archive, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { archiveProduct } from "@/app/(workspace)/supplier/products/actions";
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
import { initialProductMutationState } from "@/lib/products/form-state";

function ArchiveProductForm({
  product,
  onSuccess,
}: {
  product: { id: string; name: string };
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    archiveProduct,
    initialProductMutationState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Product archived");
      onSuccess();
    }
  }, [onSuccess, state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={product.id} />
      <FormAlert
        message={state.status === "error" ? state.message : undefined}
      />
      <div className="border-warning/25 bg-warning-subtle rounded-lg border p-4">
        <p className="font-semibold">The listing will leave the storefront.</p>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          Archive <strong className="text-foreground">{product.name}</strong>?
          Historical order references are kept, but this product can no longer
          be edited or ordered.
        </p>
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={isPending} />}>
          Keep active
        </DialogClose>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Archiving…
            </>
          ) : (
            <>
              <Archive data-icon="inline-start" aria-hidden="true" />
              Archive product
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProductArchiveDialog({
  product,
  compact = false,
}: {
  product: { id: string; name: string };
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            size="sm"
            className={compact ? "w-full" : undefined}
          />
        }
      >
        <Archive data-icon="inline-start" aria-hidden="true" />
        Archive
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive product</DialogTitle>
          <DialogDescription>
            StockFlow checks ownership and active status again before saving.
          </DialogDescription>
        </DialogHeader>
        <ArchiveProductForm
          key={open ? "open" : "closed"}
          product={product}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
