"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import {
  transitionOrder,
  type OrderTransitionState,
} from "@/app/(workspace)/order-actions";
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
import {
  getAllowedOrderTransitions,
  orderStatusDetails,
  transitionActionLabel,
  type OrderActorRole,
  type OrderStatusValue,
} from "@/lib/orders/workflow";

const initialState: OrderTransitionState = { status: "idle" };

export function OrderActionPanel({
  orderId,
  orderNumber,
  status,
  role,
}: {
  orderId: string;
  orderNumber: string;
  status: OrderStatusValue;
  role: OrderActorRole;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    transitionOrder,
    initialState,
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const allowedTransitions = getAllowedOrderTransitions(status, role);
  const forwardTransition = allowedTransitions.find(
    (target) => target !== "CANCELLED",
  );
  const canCancel = allowedTransitions.includes("CANCELLED");

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
    }

    if (state.refreshRequired) router.refresh();
  }, [router, state]);

  return (
    <section
      className="border-border/80 bg-card shadow-card rounded-2xl border p-5"
      aria-labelledby="order-actions-title"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-primary size-5" aria-hidden="true" />
        <h2 id="order-actions-title" className="font-semibold">
          Available actions
        </h2>
      </div>

      {allowedTransitions.length === 0 ? (
        <div className="bg-muted/50 mt-4 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2
              className="text-muted-foreground mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p className="text-muted-foreground text-sm leading-6">
              No further actions are available for a{" "}
              {orderStatusDetails[status].label.toLowerCase()} order.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {forwardTransition ? (
            <form action={formAction}>
              <input type="hidden" name="orderId" value={orderId} />
              <input type="hidden" name="expectedStatus" value={status} />
              <input
                type="hidden"
                name="targetStatus"
                value={forwardTransition}
              />
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <LoaderCircle
                    className="animate-spin motion-reduce:animate-none"
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowRight data-icon="inline-start" aria-hidden="true" />
                )}
                {pending
                  ? "Updating order…"
                  : transitionActionLabel(forwardTransition)}
              </Button>
            </form>
          ) : null}

          {canCancel ? (
            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <DialogTrigger
                render={
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={pending}
                  />
                }
              >
                <Ban data-icon="inline-start" aria-hidden="true" />
                Cancel order
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel {orderNumber}?</DialogTitle>
                  <DialogDescription>
                    This ends fulfilment and restores every reserved unit to
                    inventory. Shipped and delivered orders cannot be cancelled.
                  </DialogDescription>
                </DialogHeader>
                <div className="border-destructive/25 bg-destructive/5 flex items-start gap-3 rounded-lg border p-3">
                  <TriangleAlert
                    className="text-destructive mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-muted-foreground text-sm leading-6">
                    Only confirm if this order should no longer be fulfilled.
                    Stock restoration happens once and is recorded with the
                    cancellation.
                  </p>
                </div>
                <form action={formAction}>
                  <input type="hidden" name="orderId" value={orderId} />
                  <input type="hidden" name="expectedStatus" value={status} />
                  <input type="hidden" name="targetStatus" value="CANCELLED" />
                  <DialogFooter>
                    <DialogClose
                      render={<Button type="button" variant="outline" />}
                    >
                      Keep order
                    </DialogClose>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={pending}
                    >
                      {pending ? (
                        <LoaderCircle
                          className="animate-spin motion-reduce:animate-none"
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                      ) : (
                        <Ban data-icon="inline-start" aria-hidden="true" />
                      )}
                      {pending ? "Cancelling…" : "Cancel and restore stock"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      )}

      {state.status === "error" && state.message ? (
        <div
          className="border-destructive/25 bg-destructive/5 mt-4 rounded-lg border p-3"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <TriangleAlert
              className="text-destructive mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p className="text-muted-foreground text-xs leading-5">
              {state.message}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
