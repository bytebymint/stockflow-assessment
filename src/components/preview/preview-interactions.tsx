"use client";

import { toast } from "sonner";
import { BellRing, Check } from "lucide-react";

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

export function PreviewInteractions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          toast.success("Stock update saved", {
            description: "The supplier can now see the revised quantity.",
          })
        }
      >
        <BellRing data-icon="inline-start" aria-hidden="true" />
        Show feedback
      </Button>

      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Review action
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm inventory update</DialogTitle>
            <DialogDescription>
              This preview demonstrates a focused confirmation pattern before a
              meaningful change.
            </DialogDescription>
          </DialogHeader>
          <div className="border-border bg-muted/50 text-muted-foreground rounded-lg border p-4 text-sm leading-6">
            Future destructive actions will explain their impact and provide a
            clear recovery path.
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <DialogClose
              render={<Button />}
              onClick={() => toast.success("Action confirmed")}
            >
              <Check data-icon="inline-start" aria-hidden="true" />
              Confirm
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
