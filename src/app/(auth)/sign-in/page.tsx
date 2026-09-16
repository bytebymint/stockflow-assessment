import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getSafeReturnTo, getWorkspacePath } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your protected StockFlow workspace.",
};

type SignInPageProps = {
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(getWorkspacePath(user));
  }

  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = getSafeReturnTo(rawReturnTo ?? null) ?? undefined;

  return (
    <section className="w-full" aria-labelledby="sign-in-heading">
      <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
        Welcome back
      </p>
      <h1
        id="sign-in-heading"
        className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl"
      >
        Sign in to StockFlow
      </h1>
      <p className="text-muted-foreground mt-3 leading-7">
        Use your customer, supplier, or administrator credentials. We’ll send
        you to the correct workspace automatically.
      </p>
      <SignInForm returnTo={returnTo} />
    </section>
  );
}
