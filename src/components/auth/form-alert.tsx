import { CircleAlert } from "lucide-react";

type FormAlertProps = {
  message?: string;
};

export function FormAlert({ message }: FormAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="border-destructive/25 bg-destructive/5 text-destructive flex gap-3 rounded-lg border p-3 text-sm leading-5"
      role="alert"
      aria-live="polite"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
