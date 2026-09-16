import { redirect } from "next/navigation";

import { getWorkspacePath } from "@/lib/auth/paths";
import { requireUser } from "@/lib/auth/session";

export default async function ContinuePage() {
  const user = await requireUser();
  redirect(getWorkspacePath(user));
}
