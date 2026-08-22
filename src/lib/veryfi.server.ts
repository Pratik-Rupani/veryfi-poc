const VERYFI_BASE_URL = "https://api.veryfi.com/api/v8/partner/documents";

export type VeryfiLineItem = {
  description: string | null;
  quantity: number | null;
  price: number | null;
  total: number | null;
};

export type VeryfiParsedReceipt = {
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
  line_items: VeryfiLineItem[];
  raw: unknown;
};

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function veryfiConfigured(): boolean {
  return Boolean(
    process.env["VERYFI_CLIENT_ID"] &&
    process.env["VERYFI_USERNAME"] &&
    process.env["VERYFI_API_KEY"],
  );
}

export async function processDocument(
  fileName: string,
  base64Data: string,
): Promise<VeryfiParsedReceipt> {
  const clientId = process.env["VERYFI_CLIENT_ID"];
  const username = process.env["VERYFI_USERNAME"];
  const apiKey = process.env["VERYFI_API_KEY"];

  if (!clientId || !username || !apiKey) {
    throw new Error("Receipt scanning is not configured yet.");
  }

  const response = await fetch(`${VERYFI_BASE_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "CLIENT-ID": clientId,
      AUTHORIZATION: `apikey ${username}:${apiKey}`,
    },
    body: JSON.stringify({
      file_name: fileName,
      file_data: base64Data,
      auto_delete: true,
      boost_mode: false,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("Veryfi error", response.status, text.slice(0, 800));
    throw new Error(
      response.status === 401 || response.status === 403
        ? "Receipt scanning credentials were rejected."
        : "The receipt could not be read. Please try another photo.",
    );
  }

  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("Unexpected response from the scanning service.");
  }

  const vendor = (doc["vendor"] ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(doc["line_items"]) ? (doc["line_items"] as unknown[]) : [];

  const dateValue = str(doc["date"]);

  return {
    merchant_name: str(vendor["name"]) ?? str(vendor["raw_name"]),
    merchant_address: str(vendor["address"]),
    receipt_date: dateValue ? dateValue.slice(0, 10) : null,
    subtotal: num(doc["subtotal"]),
    tax: num(doc["tax"]),
    tip: num(doc["tip"]),
    total: num(doc["total"]),
    currency: str(doc["currency_code"]),
    payment_type: str((doc["payment"] as Record<string, unknown> | undefined)?.["type"]),
    category: str(doc["category"]),
    invoice_number: str(doc["invoice_number"]),
    line_items: rawItems.slice(0, 100).map((item) => {
      const li = (item ?? {}) as Record<string, unknown>;
      return {
        description: str(li["description"]),
        quantity: num(li["quantity"]),
        price: num(li["price"]),
        total: num(li["total"]),
      };
    }),
    raw: doc,
  };
}
