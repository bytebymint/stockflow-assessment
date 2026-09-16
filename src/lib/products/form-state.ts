export type ProductField =
  | "name"
  | "slug"
  | "description"
  | "categoryId"
  | "price"
  | "stock"
  | "lowStockThreshold";

export type ProductFormValues = Partial<Record<ProductField, string>>;

export type ProductFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ProductField, string[]>>;
  values?: ProductFormValues;
};

export type ProductMutationState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialProductFormState: ProductFormState = {
  status: "idle",
};

export const initialProductMutationState: ProductMutationState = {
  status: "idle",
};
