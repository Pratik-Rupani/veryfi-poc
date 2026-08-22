import { useState } from "react";
import { ChevronDown, Store, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReceiptRecord } from "@/lib/receipts.functions";

function formatMoney(value: number | null, currency: string | null) {
  if (value === null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

function formatDate(value: string | null) {
  if (!value) return "No date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function ReceiptCard({
  receipt,
  onDelete,
  deleting,
}: {
  receipt: ReceiptRecord;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="surface-card overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
          {receipt.image_url ? (
            <img
              src={receipt.image_url}
              alt={`Receipt from ${receipt.merchant_name ?? "unknown merchant"}`}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Store className="size-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">
                {receipt.merchant_name ?? "Unknown merchant"}
              </h3>
              <p className="text-xs text-muted-foreground">{formatDate(receipt.receipt_date)}</p>
            </div>
            <p className="shrink-0 text-lg font-semibold text-primary">
              {formatMoney(receipt.total, receipt.currency)}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {receipt.category ? <Badge variant="secondary">{receipt.category}</Badge> : null}
            {receipt.payment_type ? <Badge variant="outline">{receipt.payment_type}</Badge> : null}
            {receipt.tax !== null ? (
              <Badge variant="outline">Tax {formatMoney(receipt.tax, receipt.currency)}</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {receipt.line_items.length > 0
            ? `${receipt.line_items.length} item${receipt.line_items.length === 1 ? "" : "s"}`
            : "Details"}
          <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={deleting}
          onClick={() => onDelete(receipt.id)}
          aria-label="Delete receipt"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {expanded ? (
        <div className="border-t border-border bg-secondary/40 px-4 py-3 text-sm">
          {receipt.merchant_address ? (
            <p className="mb-3 text-xs text-muted-foreground">{receipt.merchant_address}</p>
          ) : null}
          <ul className="space-y-1.5">
            {receipt.line_items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span className="truncate text-muted-foreground">
                  {item.quantity ? `${item.quantity} × ` : ""}
                  {item.description ?? "Item"}
                </span>
                <span>{formatMoney(item.total ?? item.price, receipt.currency)}</span>
              </li>
            ))}
            {receipt.line_items.length === 0 ? (
              <li className="text-muted-foreground">No line items detected.</li>
            ) : null}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-border pt-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatMoney(receipt.subtotal, receipt.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatMoney(receipt.tax, receipt.currency)}</dd>
            </div>
            {receipt.tip !== null ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tip</dt>
                <dd>{formatMoney(receipt.tip, receipt.currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(receipt.total, receipt.currency)}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </article>
  );
}
