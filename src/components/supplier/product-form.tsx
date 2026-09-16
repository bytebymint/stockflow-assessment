"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";

import {
  createProduct,
  updateProduct,
} from "@/app/(workspace)/supplier/products/actions";
import { FieldError } from "@/components/auth/field-error";
import { FormAlert } from "@/components/auth/form-alert";
import {
  deleteTemporaryProductUpload,
  ProductImageUploader,
  type TemporaryProductUpload,
} from "@/components/supplier/product-image-uploader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  initialProductFormState,
  type ProductField,
} from "@/lib/products/form-state";
import { cn } from "@/lib/utils";

export type ProductFormInitialValues = Record<ProductField, string>;

type ProductFormProps = {
  categories: Array<{ id: string; name: string }>;
  initialValues?: ProductFormInitialValues;
  productId?: string;
};

const emptyValues: ProductFormInitialValues = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  price: "",
  stock: "0",
  lowStockThreshold: "5",
  imageUrl: "",
  imagePublicId: "",
  imageAlt: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export function ProductForm({
  categories,
  initialValues,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const startingValues = useMemo(
    () => initialValues ?? emptyValues,
    [initialValues],
  );
  const action = productId ? updateProduct : createProduct;
  const [state, formAction, isPending] = useActionState(
    action,
    initialProductFormState,
  );
  const [values, setValues] = useState(startingValues);
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(productId));
  const [discardOpen, setDiscardOpen] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const isSubmittingRef = useRef(false);
  const temporaryUploadRef = useRef<TemporaryProductUpload | null>(null);
  const formId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const stockRef = useRef<HTMLInputElement>(null);
  const thresholdRef = useRef<HTMLInputElement>(null);
  const imageUploadButtonRef = useRef<HTMLButtonElement>(null);
  const imageAltRef = useRef<HTMLInputElement>(null);
  const isDirty = Object.entries(values).some(
    ([field, value]) =>
      value !== startingValues[field as keyof ProductFormInitialValues],
  );

  useEffect(() => {
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      if (isDirty && !isSubmittingRef.current) {
        event.preventDefault();
      }
    }

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);

  useEffect(() => {
    if (!isPending) {
      isSubmittingRef.current = false;
    }
  }, [isPending]);

  useEffect(() => {
    if (state.status !== "error") return;

    const fields: ProductField[] = [
      "name",
      "slug",
      "description",
      "categoryId",
      "price",
      "stock",
      "lowStockThreshold",
      "imageUrl",
      "imageAlt",
    ];
    const firstInvalidField = fields.find(
      (field) => state.fieldErrors?.[field]?.length,
    );

    switch (firstInvalidField) {
      case "name":
        nameRef.current?.focus();
        break;
      case "slug":
        slugRef.current?.focus();
        break;
      case "description":
        descriptionRef.current?.focus();
        break;
      case "categoryId":
        categoryRef.current?.focus();
        break;
      case "price":
        priceRef.current?.focus();
        break;
      case "stock":
        stockRef.current?.focus();
        break;
      case "lowStockThreshold":
        thresholdRef.current?.focus();
        break;
      case "imageUrl":
      case "imagePublicId":
        imageUploadButtonRef.current?.focus();
        break;
      case "imageAlt":
        imageAltRef.current?.focus();
    }
  }, [state]);

  function updateValue(field: ProductField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function errorId(field: ProductField) {
    return state.fieldErrors?.[field]?.length
      ? `${formId}-${field}-error`
      : undefined;
  }

  function updateImage(image: { alt: string; publicId: string; url: string }) {
    setValues((current) => ({
      ...current,
      imageAlt: image.alt,
      imagePublicId: image.publicId,
      imageUrl: image.url,
    }));
  }

  async function discardChanges() {
    setIsDiscarding(true);

    if (temporaryUploadRef.current) {
      try {
        await deleteTemporaryProductUpload(temporaryUploadRef.current);
      } catch {
        // Leaving the form must remain possible if temporary remote cleanup
        // cannot complete because the browser is offline.
      }
    }

    temporaryUploadRef.current = null;
    router.push("/supplier/products");
  }

  const cancelControl = isDirty ? (
    <Button
      type="button"
      variant="outline"
      disabled={isPending || isImageUploading}
      onClick={() => setDiscardOpen(true)}
    >
      Cancel
    </Button>
  ) : (
    <Link
      href="/supplier/products"
      className={buttonVariants({ variant: "outline" })}
    >
      Cancel
    </Link>
  );

  return (
    <>
      <form
        action={formAction}
        noValidate
        className="space-y-6"
        onSubmit={(event) => {
          if (isImageUploading) {
            event.preventDefault();
            return;
          }
          isSubmittingRef.current = true;
        }}
      >
        {productId ? <input type="hidden" name="id" value={productId} /> : null}

        <FormAlert
          message={state.status === "error" ? state.message : undefined}
        />

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Product information</CardTitle>
            <p className="text-muted-foreground text-sm leading-6">
              Use clear customer-facing details. All fields are required.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor={`${formId}-name`}>Product name</Label>
              <Input
                ref={nameRef}
                id={`${formId}-name`}
                name="name"
                value={values.name}
                onChange={(event) => {
                  const name = event.target.value;
                  updateValue("name", name);
                  if (!slugWasEdited) updateValue("slug", slugify(name));
                }}
                className="mt-2"
                maxLength={160}
                autoComplete="off"
                aria-invalid={Boolean(errorId("name"))}
                aria-describedby={errorId("name")}
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
                value={values.slug}
                onChange={(event) => {
                  setSlugWasEdited(true);
                  updateValue("slug", event.target.value);
                }}
                className="mt-2 font-mono"
                maxLength={180}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={Boolean(errorId("slug"))}
                aria-describedby={cn(`${formId}-slug-help`, errorId("slug"))}
                disabled={isPending}
                required
              />
              <p
                id={`${formId}-slug-help`}
                className="text-muted-foreground mt-1.5 text-xs leading-5"
              >
                Lowercase letters, numbers, and single hyphens only.
              </p>
              <FieldError
                id={`${formId}-slug-error`}
                messages={state.fieldErrors?.slug}
              />
            </div>

            <div>
              <Label htmlFor={`${formId}-categoryId`}>Category</Label>
              <select
                ref={categoryRef}
                id={`${formId}-categoryId`}
                name="categoryId"
                value={values.categoryId}
                onChange={(event) =>
                  updateValue("categoryId", event.target.value)
                }
                className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/25 aria-invalid:border-destructive mt-2 h-11 w-full rounded-lg border px-3 text-base shadow-xs outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                aria-invalid={Boolean(errorId("categoryId"))}
                aria-describedby={errorId("categoryId")}
                disabled={isPending}
                required
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError
                id={`${formId}-categoryId-error`}
                messages={state.fieldErrors?.categoryId}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor={`${formId}-description`}>Description</Label>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {values.description.length}/2,000
                </span>
              </div>
              <Textarea
                ref={descriptionRef}
                id={`${formId}-description`}
                name="description"
                value={values.description}
                onChange={(event) =>
                  updateValue("description", event.target.value)
                }
                className="mt-2 min-h-32"
                maxLength={2_000}
                rows={5}
                aria-invalid={Boolean(errorId("description"))}
                aria-describedby={errorId("description")}
                disabled={isPending}
                required
              />
              <FieldError
                id={`${formId}-description-error`}
                messages={state.fieldErrors?.description}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Product image</CardTitle>
            <p className="text-muted-foreground text-sm leading-6">
              Upload one clear product photo and describe it for accessible
              catalog browsing. The existing image remains live until you save a
              replacement.
            </p>
          </CardHeader>
          <CardContent>
            <ProductImageUploader
              value={{
                alt: values.imageAlt,
                publicId: values.imagePublicId,
                url: values.imageUrl,
              }}
              productName={values.name}
              disabled={isPending}
              imageMessages={state.fieldErrors?.imageUrl}
              altMessages={state.fieldErrors?.imageAlt}
              uploadButtonRef={imageUploadButtonRef}
              altInputRef={imageAltRef}
              onChange={updateImage}
              onUploadingChange={setIsImageUploading}
              onTemporaryUploadChange={(upload) => {
                temporaryUploadRef.current = upload;
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Pricing and inventory</CardTitle>
            <p className="text-muted-foreground text-sm leading-6">
              Stock must be a whole number. The warning threshold controls when
              the product is labelled low stock.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor={`${formId}-price`}>Price (GBP)</Label>
              <div className="relative mt-2">
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm">
                  £
                </span>
                <Input
                  ref={priceRef}
                  id={`${formId}-price`}
                  name="price"
                  type="text"
                  inputMode="decimal"
                  value={values.price}
                  onChange={(event) => updateValue("price", event.target.value)}
                  className="pl-7 font-mono tabular-nums"
                  placeholder="0.00"
                  maxLength={13}
                  aria-invalid={Boolean(errorId("price"))}
                  aria-describedby={errorId("price")}
                  disabled={isPending}
                  required
                />
              </div>
              <FieldError
                id={`${formId}-price-error`}
                messages={state.fieldErrors?.price}
              />
            </div>

            <div>
              <Label htmlFor={`${formId}-stock`}>Stock quantity</Label>
              <Input
                ref={stockRef}
                id={`${formId}-stock`}
                name="stock"
                type="text"
                inputMode="numeric"
                value={values.stock}
                onChange={(event) => updateValue("stock", event.target.value)}
                className="mt-2 font-mono tabular-nums"
                maxLength={7}
                aria-invalid={Boolean(errorId("stock"))}
                aria-describedby={errorId("stock")}
                disabled={isPending}
                required
              />
              <FieldError
                id={`${formId}-stock-error`}
                messages={state.fieldErrors?.stock}
              />
            </div>

            <div>
              <Label htmlFor={`${formId}-lowStockThreshold`}>
                Low-stock threshold
              </Label>
              <Input
                ref={thresholdRef}
                id={`${formId}-lowStockThreshold`}
                name="lowStockThreshold"
                type="text"
                inputMode="numeric"
                value={values.lowStockThreshold}
                onChange={(event) =>
                  updateValue("lowStockThreshold", event.target.value)
                }
                className="mt-2 font-mono tabular-nums"
                maxLength={7}
                aria-invalid={Boolean(errorId("lowStockThreshold"))}
                aria-describedby={errorId("lowStockThreshold")}
                disabled={isPending}
                required
              />
              <FieldError
                id={`${formId}-lowStockThreshold-error`}
                messages={state.fieldErrors?.lowStockThreshold}
              />
            </div>
          </CardContent>
        </Card>

        <div className="border-border bg-background/95 sticky bottom-[4.5rem] z-20 -mx-4 flex flex-col-reverse gap-2 border-t px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:rounded-xl sm:border sm:p-4 lg:bottom-0">
          {cancelControl}
          <Button
            type="submit"
            disabled={isPending || isImageUploading || categories.length === 0}
          >
            {isPending || isImageUploading ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                {isImageUploading ? "Uploading image…" : "Saving…"}
              </>
            ) : (
              <>
                <Save data-icon="inline-start" aria-hidden="true" />
                {productId ? "Save changes" : "Create product"}
              </>
            )}
          </Button>
        </div>
      </form>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              The product details you changed on this page will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Keep editing
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isDiscarding}
              onClick={discardChanges}
            >
              {isDiscarding ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              )}
              {isDiscarding ? "Discarding…" : "Discard changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
