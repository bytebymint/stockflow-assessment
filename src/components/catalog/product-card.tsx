import Link from "next/link";
import { ArrowRight, Building2, Layers3 } from "lucide-react";

import { ProductMedia } from "@/components/catalog/product-media";
import { StockStatus } from "@/components/catalog/stock-status";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: PublicProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const detailHref = `/products/${product.id}`;

  return (
    <Card className="group hover:border-primary/30 hover:shadow-float h-full py-0 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5">
      <Link
        href={detailHref}
        className="focus-visible:ring-ring/30 relative block focus-visible:ring-3 focus-visible:outline-none"
        aria-label={`View ${product.name}`}
      >
        <ProductMedia
          imageUrl={product.imageUrl}
          imageAlt={product.imageAlt}
          productName={product.name}
          categoryName={product.category?.name}
        />
        <div className="absolute top-3 left-3 z-20">
          <StockStatus
            stock={product.stock}
            lowStockThreshold={product.lowStockThreshold}
          />
        </div>
      </Link>

      <CardHeader className="pt-5">
        <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-6">
            <Layers3 aria-hidden="true" />
            {product.category?.name ?? "Uncategorised"}
          </Badge>
        </div>
        <CardTitle className="text-lg">
          <Link
            href={detailHref}
            className="hover:text-primary focus-visible:ring-ring/30 rounded-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </CardTitle>
        <p className="text-muted-foreground line-clamp-2 min-h-12 text-sm leading-6">
          {product.description}
        </p>
      </CardHeader>

      <CardContent className="mt-auto pb-5">
        <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs font-medium">
          <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{product.supplier.name}</span>
        </div>
        <p className="text-foreground mt-3 font-mono text-2xl font-semibold tracking-tight tabular-nums">
          {formatPrice(product.price)}
        </p>
      </CardContent>

      <CardFooter className="p-3">
        <Link
          href={detailHref}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-between",
          )}
        >
          View details
          <ArrowRight
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            data-icon="inline-end"
            aria-hidden="true"
          />
        </Link>
      </CardFooter>
    </Card>
  );
}
