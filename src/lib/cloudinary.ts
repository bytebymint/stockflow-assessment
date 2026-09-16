import "server-only";

import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const PRODUCT_IMAGE_ALLOWED_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
] as const;

type CloudinaryCredentials = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
};

export class CloudinaryConfigurationError extends Error {
  constructor() {
    super("Cloudinary image uploads are not configured.");
    this.name = "CloudinaryConfigurationError";
  }
}

export function getCloudinaryCredentials(): CloudinaryCredentials {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryConfigurationError();
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { cloudName, apiKey, apiSecret };
}

function productImagePrefix(supplierId: string) {
  return `stockflow/products/${supplierId}/`;
}

export function createProductImageUploadSignature(supplierId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  const timestamp = Math.floor(Date.now() / 1_000);
  const publicId = `${productImagePrefix(supplierId)}${randomUUID()}`;
  const allowedFormats = PRODUCT_IMAGE_ALLOWED_FORMATS.join(",");
  const parameters = {
    allowed_formats: allowedFormats,
    overwrite: false,
    public_id: publicId,
    return_delete_token: true,
    timestamp,
  };

  return {
    apiKey,
    cloudName,
    publicId,
    signature: cloudinary.utils.api_sign_request(parameters, apiSecret),
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    uploadParameters: {
      allowed_formats: allowedFormats,
      overwrite: "false",
      public_id: publicId,
      return_delete_token: "true",
    },
  };
}

type SubmittedProductImage = {
  imageAlt: string | null;
  imagePublicId: string | null;
  imageUrl: string | null;
};

export async function verifyProductImage(
  supplierId: string,
  submittedImage: SubmittedProductImage,
): Promise<SubmittedProductImage> {
  if (!submittedImage.imagePublicId || !submittedImage.imageUrl) {
    return { imageAlt: null, imagePublicId: null, imageUrl: null };
  }

  if (
    !submittedImage.imagePublicId.startsWith(productImagePrefix(supplierId))
  ) {
    throw new Error("The uploaded image does not belong to this supplier.");
  }

  getCloudinaryCredentials();
  const asset = await cloudinary.api.resource(submittedImage.imagePublicId, {
    resource_type: "image",
    type: "upload",
  });
  const format = typeof asset.format === "string" ? asset.format : "";
  const bytes = typeof asset.bytes === "number" ? asset.bytes : 0;
  const secureUrl =
    typeof asset.secure_url === "string" ? asset.secure_url : "";

  if (
    asset.resource_type !== "image" ||
    !PRODUCT_IMAGE_ALLOWED_FORMATS.includes(
      format as (typeof PRODUCT_IMAGE_ALLOWED_FORMATS)[number],
    ) ||
    bytes <= 0 ||
    bytes > PRODUCT_IMAGE_MAX_BYTES ||
    secureUrl !== submittedImage.imageUrl
  ) {
    throw new Error("The uploaded image did not pass verification.");
  }

  return {
    imageAlt: submittedImage.imageAlt,
    imagePublicId: submittedImage.imagePublicId,
    imageUrl: secureUrl,
  };
}

export async function destroyProductImage(
  supplierId: string,
  publicId: string,
) {
  if (!publicId.startsWith(productImagePrefix(supplierId))) {
    return false;
  }

  getCloudinaryCredentials();
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
    type: "upload",
  });

  return result.result === "ok" || result.result === "not found";
}
