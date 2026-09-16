"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CircleCheck,
  Clock3,
  LoaderCircle,
  ShoppingBag,
} from "lucide-react";

import { register } from "@/app/auth-actions";
import { FieldError } from "@/components/auth/field-error";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthFormState } from "@/lib/auth/form-state";
import type { RegistrationRole } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";

type RegistrationFormProps = {
  initialRole: RegistrationRole;
};

const roleOptions = [
  {
    value: "CUSTOMER" as const,
    title: "Customer",
    description: "Browse products and place orders.",
    icon: ShoppingBag,
  },
  {
    value: "SUPPLIER" as const,
    title: "Supplier",
    description: "Apply to list and fulfil products.",
    icon: Building2,
  },
];

export function RegistrationForm({ initialRole }: RegistrationFormProps) {
  const [state, formAction, isPending] = useActionState(
    register,
    initialAuthFormState,
  );
  const [role, setRole] = useState<RegistrationRole>(
    state.values?.role ?? initialRole,
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.fieldErrors?.name?.length) {
      nameRef.current?.focus();
    } else if (state.fieldErrors?.email?.length) {
      emailRef.current?.focus();
    } else if (state.fieldErrors?.password?.length) {
      passwordRef.current?.focus();
    } else if (state.fieldErrors?.confirmPassword?.length) {
      confirmPasswordRef.current?.focus();
    }
  }, [state]);

  const errorId = (field: "name" | "email" | "password" | "confirmPassword") =>
    state.fieldErrors?.[field]?.length ? `register-${field}-error` : undefined;

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <FormAlert message={state.message} />

      <fieldset disabled={isPending}>
        <legend className="text-sm font-medium">I’m joining as</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = role === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  "focus-within:ring-ring/30 flex min-h-24 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-[border-color,background-color,box-shadow] duration-200 focus-within:ring-3",
                  isSelected
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {option.title}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs leading-5">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <FieldError
          id="register-role-error"
          messages={state.fieldErrors?.role}
        />
      </fieldset>

      {role === "SUPPLIER" ? (
        <div className="border-info/20 bg-info-subtle text-info-foreground flex gap-3 rounded-lg border p-3 text-sm leading-5">
          <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Supplier accounts enter review after registration. You can sign in
            immediately, but listing access starts after administrator approval.
          </p>
        </div>
      ) : null}

      <div>
        <Label htmlFor="register-name">
          {role === "SUPPLIER" ? "Business or contact name" : "Full name"}
        </Label>
        <Input
          key={state.values?.name ?? "register-name"}
          ref={nameRef}
          id="register-name"
          name="name"
          autoComplete="name"
          defaultValue={state.values?.name}
          aria-invalid={Boolean(errorId("name"))}
          aria-describedby={errorId("name")}
          className="mt-2"
          disabled={isPending}
          required
          maxLength={120}
        />
        <FieldError
          id="register-name-error"
          messages={state.fieldErrors?.name}
        />
      </div>

      <div>
        <Label htmlFor="register-email">Email address</Label>
        <Input
          key={state.values?.email ?? "register-email"}
          ref={emailRef}
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(errorId("email"))}
          aria-describedby={errorId("email")}
          className="mt-2"
          disabled={isPending}
          required
          maxLength={320}
        />
        <FieldError
          id="register-email-error"
          messages={state.fieldErrors?.email}
        />
      </div>

      <div>
        <Label htmlFor="register-password">Password</Label>
        <PasswordInput
          ref={passwordRef}
          id="register-password"
          name="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errorId("password"))}
          aria-describedby={
            errorId("password")
              ? `${errorId("password")} password-guidance`
              : "password-guidance"
          }
          className="mt-2"
          disabled={isPending}
          required
          minLength={12}
          maxLength={72}
        />
        <FieldError
          id="register-password-error"
          messages={state.fieldErrors?.password}
        />
        <p
          id="password-guidance"
          className="text-muted-foreground mt-2 flex gap-2 text-xs leading-5"
        >
          <CircleCheck
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          Use 12–72 characters with uppercase, lowercase, number, and symbol.
        </p>
      </div>

      <div>
        <Label htmlFor="register-confirm-password">Confirm password</Label>
        <PasswordInput
          ref={confirmPasswordRef}
          id="register-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(errorId("confirmPassword"))}
          aria-describedby={errorId("confirmPassword")}
          className="mt-2"
          disabled={isPending}
          required
          minLength={12}
          maxLength={72}
        />
        <FieldError
          id="register-confirmPassword-error"
          messages={state.fieldErrors?.confirmPassword}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            Creating account…
          </>
        ) : (
          <>
            Create {role === "SUPPLIER" ? "supplier" : "customer"} account
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="text-muted-foreground text-center text-sm leading-6">
        Already registered?{" "}
        <Link
          href="/sign-in"
          className="text-primary focus-visible:ring-ring/30 rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:outline-none"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
