"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/(workspace)/admin/categories/actions";
import { FieldError } from "@/components/auth/field-error";
import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialCategoryFormState } from "@/lib/categories/form-state";
import { cn } from "@/lib/utils";

export type EditableCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  activeProductCount: number;
};

type CategoryFormProps = {
  category?: EditableCategory;
  onSuccess: () => void;
};

function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const action = category ? updateCategory : createCategory;
  const [state, formAction, isPending] = useActionState(
    action,
    initialCategoryFormState,
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const formId = useId();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Category saved");
      onSuccess();
      return;
    }

    if (state.fieldErrors?.name?.length) {
      nameRef.current?.focus();
    } else if (state.fieldErrors?.slug?.length) {
      slugRef.current?.focus();
    } else if (state.fieldErrors?.description?.length) {
      descriptionRef.current?.focus();
    }
  }, [onSuccess, state]);

  const nameErrorId = state.fieldErrors?.name?.length
    ? `${formId}-name-error`
    : undefined;
  const slugErrorId = state.fieldErrors?.slug?.length
    ? `${formId}-slug-error`
    : undefined;
  const descriptionErrorId = state.fieldErrors?.description?.length
    ? `${formId}-description-error`
    : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <FormAlert
        message={state.status === "error" ? state.message : undefined}
      />

      <div>
        <Label htmlFor={`${formId}-name`}>Category name</Label>
        <Input
          ref={nameRef}
          id={`${formId}-name`}
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2"
          maxLength={80}
          autoComplete="off"
          aria-invalid={Boolean(nameErrorId)}
          aria-describedby={nameErrorId}
          disabled={isPending}
          required
        />
        <FieldError
          id={`${formId}-name-error`}
          messages={state.fieldErrors?.name}
        />
      </div>

      <div>
        <Label htmlFor={`${formId}-slug`}>URL slug</Label>
        <Input
          ref={slugRef}
          id={`${formId}-slug`}
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="mt-2 font-mono"
          maxLength={100}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={Boolean(slugErrorId)}
          aria-describedby={cn(`${formId}-slug-help`, slugErrorId)}
          disabled={isPending}
          required
        />
        <p
          id={`${formId}-slug-help`}
          className="text-muted-foreground mt-1.5 text-xs leading-5"
        >
          Lowercase letters, numbers, and single hyphens; for example,
          warehouse-safety.
        </p>
        <FieldError
          id={`${formId}-slug-error`}
          messages={state.fieldErrors?.slug}
        />
      </div>

      <div>
        <Label htmlFor={`${formId}-description`}>
          Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          ref={descriptionRef}
          id={`${formId}-description`}
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2"
          rows={4}
          maxLength={240}
          aria-invalid={Boolean(descriptionErrorId)}
          aria-describedby={descriptionErrorId}
          disabled={isPending}
        />
        <FieldError
          id={`${formId}-description-error`}
          messages={state.fieldErrors?.description}
        />
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={isPending} />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              {category ? "Saving…" : "Creating…"}
            </>
          ) : (
            <>{category ? "Save changes" : "Create category"}</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" aria-hidden="true" />
        New category
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
          <DialogDescription>
            Add a category that approved suppliers can use for product listings.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={open ? "open" : "closed"}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

export function EditCategoryDialog({
  category,
}: {
  category: EditableCategory;
}) {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil data-icon="inline-start" aria-hidden="true" />
        Edit
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {category.name}</DialogTitle>
          <DialogDescription>
            Changes are reflected anywhere this category labels a product.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={open ? "open" : "closed"}
          category={category}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryForm({
  category,
  onSuccess,
}: {
  category: EditableCategory;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteCategory,
    initialCategoryFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Category deleted");
      onSuccess();
    }
  }, [onSuccess, state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={category.id} />
      <FormAlert
        message={state.status === "error" ? state.message : undefined}
      />
      <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-4">
        <p className="font-semibold">This cannot be undone.</p>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          Delete <strong className="text-foreground">{category.name}</strong>?
          Archived product references will become uncategorised.
        </p>
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={isPending} />}>
          Keep category
        </DialogClose>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Deleting…
            </>
          ) : (
            <>
              <Trash2 data-icon="inline-start" aria-hidden="true" />
              Delete category
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteCategoryDialog({
  category,
}: {
  category: EditableCategory;
}) {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);

  if (category.activeProductCount > 0) {
    return (
      <Button
        variant="destructive"
        size="sm"
        disabled
        title="Reassign or archive active products before deleting this category."
      >
        <Trash2 data-icon="inline-start" aria-hidden="true" />
        In use
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 data-icon="inline-start" aria-hidden="true" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
          <DialogDescription>
            StockFlow checks for active products again before deletion.
          </DialogDescription>
        </DialogHeader>
        <DeleteCategoryForm
          key={open ? "open" : "closed"}
          category={category}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

export function CategoryRowActions({
  category,
  className,
}: {
  category: EditableCategory;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-2", className)}>
      <EditCategoryDialog category={category} />
      <DeleteCategoryDialog category={category} />
    </div>
  );
}
