"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireApprovedSupplier } from "@/lib/auth/session";
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

function refreshProductViews(productId?: string) {
  revalidatePath("/supplier/products");
  revalidatePath("/products");
  revalidatePath("/");

  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
}

async function validateProduct(
  values: ProductFormValues,
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

  return { success: true, data: parsedProduct.data };
}

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supplier = await requireApprovedSupplier();
  const values = productValues(formData);
  const validation = await validateProduct(values);

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

  refreshProductViews(productId);
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

  const validation = await validateProduct(values);

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

  refreshProductViews(parsedId.data);
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

  refreshProductViews(parsedId.data);

  return {
    status: "success",
    message: "Product archived and removed from the public catalog.",
  };
}
