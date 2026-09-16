import { z } from "zod";

import {
  CloudinaryConfigurationError,
  createProductImageUploadSignature,
  PRODUCT_IMAGE_ALLOWED_TYPES,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth/session";

const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileSize: z.number().int().positive().max(PRODUCT_IMAGE_MAX_BYTES),
  fileType: z.enum(PRODUCT_IMAGE_ALLOWED_TYPES),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { message: "Sign in to upload images." },
      { status: 401 },
    );
  }

  if (user.role !== "SUPPLIER" || user.supplierStatus !== "APPROVED") {
    return Response.json(
      { message: "An approved supplier account is required." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "The upload request is invalid." },
      { status: 400 },
    );
  }

  const parsedRequest = uploadRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return Response.json(
      {
        message: "Choose a JPG, PNG, WebP, or AVIF image no larger than 5 MB.",
      },
      { status: 400 },
    );
  }

  try {
    return Response.json(createProductImageUploadSignature(user.id), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof CloudinaryConfigurationError) {
      return Response.json(
        {
          message:
            "Image uploads are not configured yet. Add the Cloudinary environment variables and retry.",
        },
        { status: 503 },
      );
    }

    return Response.json(
      { message: "The image upload could not be authorized. Please retry." },
      { status: 500 },
    );
  }
}
