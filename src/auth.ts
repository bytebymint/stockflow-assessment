import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import type { SupplierStatus, UserRole } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/database";
import { signInSchema } from "@/lib/auth/validation";

const DUMMY_PASSWORD_HASH =
  "$2b$12$BbDEg2C7nnPzcHeo8L6GTeJMBHkJomNvx9wLIIqEQH4nVuWCjpSY6";

function isUserRole(value: unknown): value is UserRole {
  return value === "ADMIN" || value === "SUPPLIER" || value === "CUSTOMER";
}

function isSupplierStatus(value: unknown): value is SupplierStatus {
  return value === "PENDING" || value === "APPROVED" || value === "REJECTED";
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const database = getDatabase();
        const user = await database.user.findUnique({
          where: { email: parsedCredentials.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            supplierStatus: true,
          },
        });

        const passwordMatches = await compare(
          parsedCredentials.data.password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );

        if (!user || !passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          supplierStatus: user.supplierStatus,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.supplierStatus = user.supplierStatus;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id =
        typeof token.id === "string"
          ? token.id
          : (token.sub ?? "00000000-0000-0000-0000-000000000000");
      session.user.role = isUserRole(token.role) ? token.role : "CUSTOMER";
      session.user.supplierStatus = isSupplierStatus(token.supplierStatus)
        ? token.supplierStatus
        : null;

      return session;
    },
  },
});
