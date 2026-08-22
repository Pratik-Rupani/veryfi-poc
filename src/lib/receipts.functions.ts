export type ReceiptLineItem = {
  description: string | null;
  quantity: number | null;
  price: number | null;
  total: number | null;
};

export type ReceiptRecord = {
  id: string;
  merchant_name: string | null;
  merchant_address: string | null;
  receipt_date: string | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
  currency: string | null;
  payment_type: string | null;
  category: string | null;
  invoice_number: string | null;
  line_items: ReceiptLineItem[];
  created_at: string;
  image_url: string | null;
};

export type ScanInput = { fileName: string; contentType: string; base64: string };
export type ScanResult = { ok: true; id: string } | { ok: false; error: string };

export async function listReceipts(): Promise<ReceiptRecord[]> {
  const response = await fetch("/api/receipts", { cache: "no-store" });
  if (!response.ok) return [];
  return (await response.json()) as ReceiptRecord[];
}

export async function scanReceipt(input: ScanInput): Promise<ScanResult> {
  const response = await fetch("/api/receipts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await response.json()) as ScanResult;
}

export async function deleteReceipt(id: string): Promise<{ ok: boolean }> {
  const response = await fetch(`/api/receipts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  return (await response.json()) as { ok: boolean };
}
