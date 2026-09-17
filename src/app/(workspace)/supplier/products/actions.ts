"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireApprovedSupplier } from "@/lib/auth/session";
import { invalidateInventoryCaches } from "@/lib/cache/tags";
import {
  CloudinaryConfigurationError,
  destroyProductImage,
  verifyProductImage,
} from "@/lib/cloudinary";
import { getDatabase } from "@/lib/database";
import type {
  ProductField,
  ProductFormState,
  ProductFormValues,
  ProductMutationState,
} from "@/lib/products/form-state";
import { productIdSchema, productSchema } from "@/lib/products/validation";

function productValues(formData: FormData): ProductFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    price: String(formData.get("price") ?? ""),
    stock: String(formData.get("stock") ?? ""),
    lowStockThreshold: String(formData.get("lowStockThreshold") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    imagePublicId: String(formData.get("imagePublicId") ?? ""),
    imageAlt: String(formData.get("imageAlt") ?? ""),
  };
}

function validationErrors(
  errors: Record<string, string[] | undefined>,
): Partial<Record<ProductField, string[]>> {
  return Object.fromEntries(
    Object.entries(errors).filter(([, messages]) => messages?.length),
  ) as Partial<Record<ProductField, string[]>>;
}

function isPrismaError(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function refreshProductViews(supplierId: string, productId?: string) {
  invalidateInventoryCaches(supplierId);
  revalidatePath("/supplier/products");
  revalidatePath("/products");
  revalidatePath("/");

  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
}

async function validateProduct(
  values: ProductFormValues,
  supplierId: string,
  currentProduct?: {
    id: string;
    imagePublicId: string | null;
    imageUrl: string | null;
  },
): Promise<
  | { success: true; data: ReturnType<typeof productSchema.parse> }
  | { success: false; state: ProductFormState }
> {
  const parsedProduct = productSchema.safeParse(values);

  if (!parsedProduct.success) {
    return {
      success: false,
      state: {
        status: "error",
        message: "Check the highlighted fields and try again.",
        fieldErrors: validationErrors(
          parsedProduct.error.flatten().fieldErrors,
        ),
        values,
      },
    };
  }

  const category = await getDatabase().category.findUnique({
    where: { id: parsedProduct.data.categoryId },
    select: { id: true },
  });

  if (!category) {
    return {
      success: false,
      state: {
        status: "error",
        message: "The selected category is no longer available.",
        fieldErrors: { categoryId: ["Choose an available category."] },
        values,
      },
    };
  }

  let verifiedImage: {
    imageAlt: string | null;
    imagePublicId: string | null;
    imageUrl: string | null;
  };

  try {
    const imageIsUnchanged =
      currentProduct?.imagePublicId === parsedProduct.data.imagePublicId &&
      currentProduct?.imageUrl === parsedProduct.data.imageUrl;

    verifiedImage = imageIsUnchanged
      ? {
          imageAlt: parsedProduct.data.imageAlt,
          imagePublicId: currentProduct.imagePublicId,
          imageUrl: currentProduct.imageUrl,
        }
      : await verifyProductImage(supplierId, {
          imageAlt: parsedProduct.data.imageAlt,
          imagePublicId: parsedProduct.data.imagePublicId,
          imageUrl: parsedProduct.data.imageUrl,
        });
  } catch (error) {
    return {
      success: false,
      state: {
        status: "error",
        message:
          error instanceof CloudinaryConfigurationError
            ? "Image uploads are not configured. Add the Cloudinary environment variables and retry."
            : "The uploaded image could not be verified. Upload it again and retry.",
        fieldErrors: {
          imageUrl: ["Upload a valid product image again."],
        },
        values,
      },
    };
  }

  if (verifiedImage.imagePublicId) {
    const imageOwner = await getDatabase().product.findFirst({
      where: {
        imagePublicId: verifiedImage.imagePublicId,
        ...(currentProduct ? { id: { not: currentProduct.id } } : {}),
      },
      select: { id: true },
    });

    if (imageOwner) {
      return {
        success: false,
        state: {
          status: "error",
          message: "This image is already assigned to another product.",
          fieldErrors: { imageUrl: ["Upload a different image."] },
          values,
        },
      };
    }
  }

  return {
    success: true,
    data: { ...parsedProduct.data, ...verifiedImage },
  };
}

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supplier = await requireApprovedSupplier();
  const values = productValues(formData);
  const validation = await validateProduct(values, supplier.id);

  if (!validation.success) {
    return validation.state;
  }

  let productId: string;

  try {
    const product = await getDatabase().product.create({
      data: {
        ...validation.data,
        supplierId: supplier.id,
      },
      select: { id: true },
    });
    productId = product.id;
  } catch (error) {
    return {
      status: "error",
      message: isPrismaError(error, "P2002")
        ? "One of your products already uses this URL slug."
        : "The product could not be created. Please try again.",
      values,
    };
  }

  refreshProductViews(supplier.id, productId);
  redirect("/supplier/products?notice=created");
}

export async function updateProduct(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supplier = await requireApprovedSupplier();
  const parsedId = productIdSchema.safeParse(formData.get("id"));
  const values = productValues(formData);

  if (!parsedId.success) {
    return {
      status: "error",
      message: "This product reference is invalid. Return to your inventory.",
      values,
    };
  }

  const currentProduct = await getDatabase().product.findFirst({
    where: {
      id: parsedId.data,
      supplierId: supplier.id,
      archivedAt: null,
    },
    select: { id: true, imagePublicId: true, imageUrl: true },
  });

  if (!currentProduct) {
    return {
      status: "error",
      message:
        "This active product was not found in your inventory. Return to the product list and refresh.",
      values,
    };
  }

  const validation = await validateProduct(values, supplier.id, currentProduct);

  if (!validation.success) {
    return validation.state;
  }

  try {
    const updated = await getDatabase().product.updateMany({
      where: {
        id: parsedId.data,
        supplierId: supplier.id,
        archivedAt: null,
      },
      data: validation.data,
    });

    if (updated.count === 0) {
      return {
        status: "error",
        message:
          "This active product was not found in your inventory. Return to the product list and refresh.",
        values,
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: isPrismaError(error, "P2002")
        ? "One of your products already uses this URL slug."
        : "The product could not be updated. Please try again.",
      values,
    };
  }

  refreshProductViews(supplier.id, parsedId.data);

  if (
    currentProduct.imagePublicId &&
    currentProduct.imagePublicId !== validation.data.imagePublicId
  ) {
    try {
      await destroyProductImage(supplier.id, currentProduct.imagePublicId);
    } catch (error) {
      console.error("Unable to remove the replaced Cloudinary image.", error);
    }
  }

  redirect("/supplier/products?notice=updated");
}

export async function archiveProduct(
  _previousState: ProductMutationState,
  formData: FormData,
): Promise<ProductMutationState> {
  const supplier = await requireApprovedSupplier();
  const parsedId = productIdSchema.safeParse(formData.get("id"));

  if (!parsedId.success) {
    return {
      status: "error",
      message: "This product reference is invalid. Refresh and try again.",
    };
  }

  try {
    const archived = await getDatabase().product.updateMany({
      where: {
        id: parsedId.data,
        supplierId: supplier.id,
        archivedAt: null,
      },
      data: { archivedAt: new Date() },
    });

    if (archived.count === 0) {
      return {
        status: "error",
        message: "This active product is no longer available to archive.",
      };
    }
  } catch {
    return {
      status: "error",
      message: "The product could not be archived. Please try again.",
    };
  }

  refreshProductViews(supplier.id, parsedId.data);

  return {
    status: "success",
    message: "Product archived and removed from the public catalog.",
  };
}
