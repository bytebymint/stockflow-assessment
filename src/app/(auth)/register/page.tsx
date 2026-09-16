import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegistrationForm } from "@/components/auth/registration-form";
import { getWorkspacePath } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a StockFlow customer or supplier account.",
};

type RegisterPageProps = {
  searchParams: Promise<{ role?: string | string[] }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(getWorkspacePath(user));
  }

  const params = await searchParams;
  const requestedRole = Array.isArray(params.role)
    ? params.role[0]
    : params.role;
  const initialRole = requestedRole === "supplier" ? "SUPPLIER" : "CUSTOMER";

  return (
    <section className="w-full" aria-labelledby="register-heading">
      <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
        Join StockFlow
      </p>
      <h1
        id="register-heading"
        className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl"
      >
        Create your account
      </h1>
      <p className="text-muted-foreground mt-3 leading-7">
        Customer access is immediate. Supplier accounts are reviewed before
        product listing becomes available.
      </p>
      <RegistrationForm initialRole={initialRole} />
    </section>
  );
}
