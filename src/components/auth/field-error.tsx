type FieldErrorProps = {
  id: string;
  messages?: string[];
};

export function FieldError({ id, messages }: FieldErrorProps) {
  const message = messages?.[0];

  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-destructive mt-1.5 text-sm">
      {message}
    </p>
  );
}
