export type SupplierDecisionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialSupplierDecisionState: SupplierDecisionState = {
  status: "idle",
};
