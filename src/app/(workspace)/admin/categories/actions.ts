"use server";

import { revalidatePath } from "next/cache";

import type {
  CategoryField,
  CategoryFormState,
} from "@/lib/categories/form-state";
import { invalidatePublicCatalogCache } from "@/lib/cache/tags";
import { categoryIdSchema, categorySchema } from "@/lib/categories/validation";
import { requireRole } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";

function categoryValues(formData: FormData) {
  return {
    name:
      typeof formData.get("name") === "string"
        ? String(formData.get("name"))
        : "",
    slug:
      typeof formData.get("slug") === "string"
        ? String(formData.get("slug"))
        : "",
    description:
      typeof formData.get("description") === "string"
        ? String(formData.get("description"))
        : "",
  };
}

function validationErrors(
  errors: Record<string, string[] | undefined>,
): Partial<Record<CategoryField, string[]>> {
  return Object.fromEntries(
    Object.entries(errors).filter(([, messages]) => messages?.length),
  ) as Partial<Record<CategoryField, string[]>>;
}

function isPrismaError(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function refreshCategoryViews() {
  invalidatePublicCatalogCache();
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function createCategory(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireRole("ADMIN");

  const values = categoryValues(formData);
  const parsedCategory = categorySchema.safeParse(values);

  if (!parsedCategory.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: validationErrors(parsedCategory.error.flatten().fieldErrors),
      values,
    };
  }

  try {
    await getDatabase().category.create({ data: parsedCategory.data });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return {
        status: "error",
        message: "A category already uses this name or URL slug.",
        values,
      };
    }

    return {
      status: "error",
      message: "The category could not be created. Please try again.",
      values,
    };
  }

  refreshCategoryViews();

  return {
    status: "success",
    message: `${parsedCategory.data.name} was created.`,
  };
}

export async function updateCategory(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireRole("ADMIN");

  const id = formData.get("id");
  const parsedId = categoryIdSchema.safeParse(id);
  const values = categoryValues(formData);
  const parsedCategory = categorySchema.safeParse(values);

  if (!parsedId.success) {
    return {
      status: "error",
      message: "This category reference is invalid. Refresh and try again.",
      values,
    };
  }

  if (!parsedCategory.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: validationErrors(parsedCategory.error.flatten().fieldErrors),
      values,
    };
  }

  try {
    await getDatabase().category.update({
      where: { id: parsedId.data },
      data: parsedCategory.data,
    });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return {
        status: "error",
        message: "A category already uses this name or URL slug.",
        values,
      };
    }

    if (isPrismaError(error, "P2025")) {
      return {
        status: "error",
        message: "This category no longer exists. Refresh the page.",
        values,
      };
    }

    return {
      status: "error",
      message: "The category could not be updated. Please try again.",
      values,
    };
  }

  refreshCategoryViews();

  return {
    status: "success",
    message: `${parsedCategory.data.name} was updated.`,
  };
}

export async function deleteCategory(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireRole("ADMIN");

  const parsedId = categoryIdSchema.safeParse(formData.get("id"));

  if (!parsedId.success) {
    return {
      status: "error",
      message: "This category reference is invalid. Refresh and try again.",
    };
  }

  const database = getDatabase();

  try {
    const deletion = await database.category.deleteMany({
      where: {
        id: parsedId.data,
        products: {
          none: { archivedAt: null },
        },
      },
    });

    if (deletion.count === 0) {
      const category = await database.category.findUnique({
        where: { id: parsedId.data },
        select: {
          name: true,
          _count: {
            select: {
              products: { where: { archivedAt: null } },
            },
          },
        },
      });

      return category
        ? {
            status: "error",
            message: `${category.name} still has ${category._count.products} active product${category._count.products === 1 ? "" : "s"}. Reassign or archive them first.`,
          }
        : {
            status: "error",
            message: "This category no longer exists. Refresh the page.",
          };
    }
  } catch {
    return {
      status: "error",
      message: "The category could not be deleted. Please try again.",
    };
  }

  refreshCategoryViews();

  return {
    status: "success",
    message: "The category was deleted.",
  };
}
