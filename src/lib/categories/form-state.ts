export type CategoryField = "name" | "slug" | "description";

export type CategoryFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<CategoryField, string[]>>;
  values?: {
    name?: string;
    slug?: string;
    description?: string;
  };
};

export const initialCategoryFormState: CategoryFormState = {
  status: "idle",
};
