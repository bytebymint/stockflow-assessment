"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
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

export function ClearCartDialog() {
  const [open, setOpen] = useState(false);
  const { clearCart } = useCart();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Trash2 data-icon="inline-start" aria-hidden="true" />
        Clear cart
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear your cart?</DialogTitle>
          <DialogDescription>
            Every product and saved quantity will be removed from this browser.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Keep cart
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              clearCart();
              setOpen(false);
            }}
          >
            <Trash2 data-icon="inline-start" aria-hidden="true" />
            Clear cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
