"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { authenticate } from "@/app/auth-actions";
import { FieldError } from "@/components/auth/field-error";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthFormState } from "@/lib/auth/form-state";

type SignInFormProps = {
  returnTo?: string;
};

export function SignInForm({ returnTo }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialAuthFormState,
  );
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.fieldErrors?.email?.length) {
      emailRef.current?.focus();
    } else if (state.fieldErrors?.password?.length) {
      passwordRef.current?.focus();
    }
  }, [state]);

  const emailErrorId = state.fieldErrors?.email?.length
    ? "sign-in-email-error"
    : undefined;
  const passwordErrorId = state.fieldErrors?.password?.length
    ? "sign-in-password-error"
    : undefined;

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      {returnTo ? (
        <input type="hidden" name="returnTo" value={returnTo} />
      ) : null}

      <FormAlert message={state.message} />

      <div>
        <Label htmlFor="sign-in-email">Email address</Label>
        <Input
          key={state.values?.email ?? "sign-in-email"}
          ref={emailRef}
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(emailErrorId)}
          aria-describedby={emailErrorId}
          className="mt-2"
          disabled={isPending}
          required
        />
        <FieldError
          id="sign-in-email-error"
          messages={state.fieldErrors?.email}
        />
      </div>

      <div>
        <Label htmlFor="sign-in-password">Password</Label>
        <PasswordInput
          ref={passwordRef}
          id="sign-in-password"
          name="password"
          autoComplete="current-password"
          aria-invalid={Boolean(passwordErrorId)}
          aria-describedby={passwordErrorId}
          className="mt-2"
          disabled={isPending}
          required
        />
        <FieldError
          id="sign-in-password-error"
          messages={state.fieldErrors?.password}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="text-muted-foreground text-center text-sm leading-6">
        New to StockFlow?{" "}
        <Link
          href="/register"
          className="text-primary focus-visible:ring-ring/30 rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:outline-none"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
