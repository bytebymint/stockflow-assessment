import { getCurrentUser } from "@/lib/auth/session";
import { CheckoutConflictError, createCheckout } from "@/lib/checkout";
import {
  checkoutRequestSchema,
  type CheckoutErrorResponse,
  type CheckoutSuccessResponse,
} from "@/lib/checkout-contract";

export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        message: "Sign in with a customer account to check out.",
      } satisfies CheckoutErrorResponse,
      { status: 401, headers: noStoreHeaders },
    );
  }

  if (user.role !== "CUSTOMER") {
    return Response.json(
      {
        message: "A customer account is required to check out.",
      } satisfies CheckoutErrorResponse,
      { status: 403, headers: noStoreHeaders },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        message: "The checkout request is not valid JSON.",
      } satisfies CheckoutErrorResponse,
      { status: 400, headers: noStoreHeaders },
    );
  }

  const parsedRequest = checkoutRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return Response.json(
      {
        message: "The cart contains invalid products or quantities.",
      } satisfies CheckoutErrorResponse,
      { status: 400, headers: noStoreHeaders },
    );
  }

  try {
    const checkout = await createCheckout(user.id, parsedRequest.data);

    return Response.json({ checkout } satisfies CheckoutSuccessResponse, {
      status: 201,
      headers: noStoreHeaders,
    });
  } catch (error) {
    if (error instanceof CheckoutConflictError) {
      return Response.json(
        {
          message: error.message,
          issues: error.issues,
        } satisfies CheckoutErrorResponse,
        { status: 409, headers: noStoreHeaders },
      );
    }

    console.error("Checkout failed", error);
    return Response.json(
      {
        message:
          "Checkout could not be completed. Your cart is unchanged; please try again.",
      } satisfies CheckoutErrorResponse,
      { status: 500, headers: noStoreHeaders },
    );
  }
}
