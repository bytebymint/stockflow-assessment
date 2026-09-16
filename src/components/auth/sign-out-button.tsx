"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle, LogOut } from "lucide-react";

import { endSession } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  inverse?: boolean;
  compact?: boolean;
};

function SignOutSubmit({ inverse, compact }: SignOutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size={compact ? "icon" : "sm"}
      disabled={pending}
      className={cn(
        inverse &&
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        !compact && "w-full justify-start",
      )}
      aria-label={compact ? "Sign out" : undefined}
    >
      {pending ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut aria-hidden="true" />
      )}
      {compact ? null : pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

export function SignOutButton(props: SignOutButtonProps) {
  return (
    <form action={endSession}>
      <SignOutSubmit {...props} />
    </form>
  );
}
