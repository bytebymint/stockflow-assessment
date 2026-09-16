"use client";

import type { DragEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CircleCheck,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

type ProductImageValue = {
  alt: string;
  publicId: string;
  url: string;
};

export type TemporaryProductUpload = {
  cloudName: string;
  deleteToken: string;
};

type UploadSignature = {
  apiKey: string;
  cloudName: string;
  publicId: string;
  signature: string;
  timestamp: number;
  uploadUrl: string;
  uploadParameters: Record<string, string>;
};

type CloudinaryUploadResponse = {
  delete_token?: string;
  public_id?: string;
  secure_url?: string;
  error?: { message?: string };
};

type ProductImageUploaderProps = {
  altInputRef: RefObject<HTMLInputElement | null>;
  altMessages?: string[];
  disabled: boolean;
  imageMessages?: string[];
  onChange: (image: ProductImageValue) => void;
  onTemporaryUploadChange: (upload: TemporaryProductUpload | null) => void;
  onUploadingChange: (isUploading: boolean) => void;
  productName: string;
  uploadButtonRef: RefObject<HTMLButtonElement | null>;
  value: ProductImageValue;
};

export async function deleteTemporaryProductUpload(
  upload: TemporaryProductUpload,
) {
  const formData = new FormData();
  formData.set("token", upload.deleteToken);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(upload.cloudName)}/delete_by_token`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error("Temporary image cleanup failed.");
  }
}

function validateFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Choose a JPG, PNG, WebP, or AVIF image.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Choose an image no larger than 5 MB.";
  }

  if (file.size === 0) {
    return "This image file is empty. Choose another file.";
  }

  return null;
}

function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
  onProgress: (progress: number) => void,
  signal: AbortSignal,
) {
  return new Promise<CloudinaryUploadResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();

    formData.set("file", file);
    formData.set("api_key", signature.apiKey);
    formData.set("signature", signature.signature);
    formData.set("timestamp", String(signature.timestamp));
    Object.entries(signature.uploadParameters).forEach(([key, value]) => {
      formData.set(key, value);
    });

    request.open("POST", signature.uploadUrl);
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      const response = request.response as CloudinaryUploadResponse | null;

      if (request.status >= 200 && request.status < 300 && response) {
        resolve(response);
        return;
      }

      reject(
        new Error(
          response?.error?.message || "Cloudinary rejected the image upload.",
        ),
      );
    });
    request.addEventListener("error", () => {
      reject(new Error("The network interrupted the image upload."));
    });
    request.addEventListener("abort", () => {
      reject(new DOMException("The image upload was cancelled.", "AbortError"));
    });
    signal.addEventListener("abort", () => request.abort(), { once: true });
    request.send(formData);
  });
}

export function ProductImageUploader({
  altInputRef,
  altMessages,
  disabled,
  imageMessages,
  onChange,
  onTemporaryUploadChange,
  onUploadingChange,
  productName,
  uploadButtonRef,
  value,
}: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const temporaryUploadRef = useRef<TemporaryProductUpload | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    return () => {
      uploadControllerRef.current?.abort();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  async function clearTemporaryUpload() {
    const upload = temporaryUploadRef.current;
    temporaryUploadRef.current = null;
    onTemporaryUploadChange(null);

    if (upload) {
      try {
        await deleteTemporaryProductUpload(upload);
      } catch {
        // The short-lived Cloudinary delete token may expire or the browser may
        // be offline. This does not affect the product record being edited.
      }
    }
  }

  async function handleFile(file: File) {
    if (disabled || isUploading) return;

    const validationMessage = validateFile(file);

    if (validationMessage) {
      setUploadError(validationMessage);
      return;
    }

    uploadControllerRef.current?.abort();
    const previousTemporaryUpload = temporaryUploadRef.current;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    previewUrlRef.current = localPreview;
    setPreviewUrl(localPreview);
    setImageFailed(false);
    setUploadError(undefined);
    setProgress(0);
    setIsUploading(true);
    onUploadingChange(true);

    const controller = new AbortController();
    uploadControllerRef.current = controller;

    try {
      const signatureResponse = await fetch("/api/products/images/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
        signal: controller.signal,
      });
      const signatureBody = (await signatureResponse.json()) as
        UploadSignature | { message?: string };

      if (!signatureResponse.ok || !("signature" in signatureBody)) {
        const message =
          "message" in signatureBody ? signatureBody.message : undefined;
        throw new Error(message || "The image upload could not be authorized.");
      }

      const uploadedImage = await uploadToCloudinary(
        file,
        signatureBody,
        setProgress,
        controller.signal,
      );

      if (
        !uploadedImage.secure_url ||
        uploadedImage.public_id !== signatureBody.publicId ||
        !uploadedImage.delete_token
      ) {
        throw new Error("Cloudinary returned an incomplete image record.");
      }

      const temporaryUpload = {
        cloudName: signatureBody.cloudName,
        deleteToken: uploadedImage.delete_token,
      };
      temporaryUploadRef.current = temporaryUpload;
      onTemporaryUploadChange(temporaryUpload);
      onChange({
        alt:
          value.alt.trim() ||
          `${productName.trim() || "Product"} product image`,
        publicId: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      });
      setProgress(100);

      if (previousTemporaryUpload) {
        try {
          await deleteTemporaryProductUpload(previousTemporaryUpload);
        } catch {
          // The newly uploaded image remains usable even if an older temporary
          // upload cannot be removed immediately.
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      setUploadError(
        error instanceof Error
          ? error.message
          : "The image upload failed. Choose the file and retry.",
      );
      setPreviewUrl(null);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    } finally {
      if (uploadControllerRef.current === controller) {
        uploadControllerRef.current = null;
        setIsUploading(false);
        onUploadingChange(false);
      }
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  async function removeImage() {
    uploadControllerRef.current?.abort();
    await clearTemporaryUpload();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setProgress(0);
    setUploadError(undefined);
    setImageFailed(false);
    onChange({ alt: "", publicId: "", url: "" });
    setRemoveOpen(false);
  }

  const displayedImage = previewUrl || value.url;
  const hasImage = Boolean(displayedImage) && !imageFailed;

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="bg-muted relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border">
          {hasImage && displayedImage ? (
            <Image
              src={displayedImage}
              alt={value.alt || "Product image preview"}
              fill
              unoptimized={displayedImage.startsWith("blob:")}
              sizes="(min-width: 1024px) 288px, 100vw"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center px-6 text-center">
              <span className="bg-card text-primary shadow-card flex size-12 items-center justify-center rounded-xl border">
                <ImagePlus className="size-5" aria-hidden="true" />
              </span>
              <p className="text-foreground mt-3 text-sm font-semibold">
                No product image
              </p>
              <p className="mt-1 text-xs leading-5">
                The catalog fallback remains visible until an image is saved.
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-5">
          <div
            className={cn(
              "border-border bg-muted/30 rounded-xl border border-dashed p-5 transition-[border-color,background-color] duration-200",
              isDragging && "border-primary bg-accent",
              uploadError && "border-destructive/50 bg-destructive/5",
            )}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setIsDragging(false);
              }
            }}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="sr-only"
              tabIndex={-1}
              disabled={disabled || isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {value.url ? "Replace product image" : "Upload product image"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  JPG, PNG, WebP, or AVIF. Maximum 5 MB.
                </p>
              </div>
              <Button
                ref={uploadButtonRef}
                type="button"
                variant="outline"
                disabled={disabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : value.url ? (
                  <RefreshCw aria-hidden="true" />
                ) : (
                  <UploadCloud aria-hidden="true" />
                )}
                {isUploading
                  ? "Uploading…"
                  : value.url
                    ? "Replace"
                    : "Choose image"}
              </Button>
            </div>

            {isUploading ? (
              <div className="mt-4" aria-live="polite">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium">
                  <span>Uploading securely to Cloudinary</span>
                  <span className="font-mono tabular-nums">{progress}%</span>
                </div>
                <div
                  className="bg-secondary h-2 overflow-hidden rounded-full"
                  role="progressbar"
                  aria-label="Image upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : progress === 100 && value.url ? (
              <p
                className="text-success-foreground mt-4 flex items-center gap-2 text-sm font-medium"
                role="status"
              >
                <CircleCheck className="size-4" aria-hidden="true" />
                Upload complete. Save the product to publish this image.
              </p>
            ) : null}

            {uploadError ? (
              <p
                className="text-destructive mt-4 text-sm leading-6"
                role="alert"
              >
                {uploadError} Select the image again to retry.
              </p>
            ) : null}
            <FieldError id="product-image-error" messages={imageMessages} />
          </div>

          <div>
            <Label htmlFor="product-image-alt">Image description</Label>
            <Input
              ref={altInputRef}
              id="product-image-alt"
              name="imageAlt"
              value={value.alt}
              onChange={(event) =>
                onChange({ ...value, alt: event.target.value })
              }
              className="mt-2"
              maxLength={180}
              placeholder="For example: Cordless drill with two batteries"
              aria-invalid={Boolean(altMessages?.length)}
              aria-describedby="product-image-alt-help product-image-alt-error"
              disabled={disabled || !value.url}
              required={Boolean(value.url)}
            />
            <p
              id="product-image-alt-help"
              className="text-muted-foreground mt-1.5 text-xs leading-5"
            >
              Describe the product for customers who cannot see the image.
            </p>
            <FieldError id="product-image-alt-error" messages={altMessages} />
          </div>

          {value.url ? (
            <Button
              type="button"
              variant="destructive"
              disabled={disabled || isUploading}
              onClick={() => setRemoveOpen(true)}
            >
              <Trash2 aria-hidden="true" />
              Remove image
            </Button>
          ) : null}
        </div>
      </div>

      <input type="hidden" name="imageUrl" value={value.url} />
      <input type="hidden" name="imagePublicId" value={value.publicId} />

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove product image?</DialogTitle>
            <DialogDescription>
              The catalog fallback will be used after you save the product.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Keep image
            </DialogClose>
            <Button type="button" variant="destructive" onClick={removeImage}>
              <Trash2 aria-hidden="true" />
              Remove image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
