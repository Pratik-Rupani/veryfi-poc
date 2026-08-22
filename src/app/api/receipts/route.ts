import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { processDocument } from "@/lib/veryfi.server";
import type { ReceiptLineItem } from "@/lib/receipts.functions";
import { validateScanInput } from "@/lib/scan-validation";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("receipts")
    .select(
      "id, merchant_name, merchant_address, receipt_date, subtotal, tax, tip, total, currency, payment_type, category, invoice_number, line_items, created_at, storage_path",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("listReceipts error", error);
    return NextResponse.json([]);
  }
  const rows = data ?? [];
  const paths = rows
    .map((row) => row.storage_path)
    .filter((path): path is string => typeof path === "string" && path.length > 0);
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabaseAdmin.storage
      .from("receipts")
      .createSignedUrls(paths, 60 * 60 * 24 * 7);
    for (const entry of signed ?? [])
      if (entry.path && entry.signedUrl) urlByPath.set(entry.path, entry.signedUrl);
  }
  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      merchant_name: row.merchant_name,
      merchant_address: row.merchant_address,
      receipt_date: row.receipt_date,
      subtotal: row.subtotal === null ? null : Number(row.subtotal),
      tax: row.tax === null ? null : Number(row.tax),
      tip: row.tip === null ? null : Number(row.tip),
      total: row.total === null ? null : Number(row.total),
      currency: row.currency,
      payment_type: row.payment_type,
      category: row.category,
      invoice_number: row.invoice_number,
      line_items: Array.isArray(row.line_items) ? (row.line_items as ReceiptLineItem[]) : [],
      created_at: row.created_at,
      image_url: row.storage_path ? (urlByPath.get(row.storage_path) ?? null) : null,
    })),
  );
}

export async function POST(request: Request) {
  const input = (await request.json()) as Partial<{
    fileName: string;
    contentType: string;
    base64: string;
  }>;
  const base64 = input.base64 ?? "";
  const validationError = validateScanInput({ ...input, base64 });
  if (validationError)
    return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
  const fileName = input.fileName || "receipt.jpg";
  const contentType = input.contentType?.startsWith("image/") ? input.contentType : "image/jpeg";
  let parsed;
  try {
    parsed = await processDocument(fileName, base64);
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Scanning failed.",
    });
  }
  const storagePath = `${crypto.randomUUID()}.${contentType === "image/png" ? "png" : "jpg"}`;
  try {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const { error } = await supabaseAdmin.storage
      .from("receipts")
      .upload(storagePath, bytes, { contentType, upsert: false });
    if (error) console.error("receipt upload error", error);
  } catch (error) {
    console.error("receipt upload exception", error);
  }
  const { data: inserted, error } = await supabaseAdmin
    .from("receipts")
    .insert({ ...parsed, raw: parsed.raw as never, storage_path: storagePath })
    .select("id")
    .single();
  if (error || !inserted) {
    console.error("receipt insert error", error);
    return NextResponse.json({ ok: false, error: "The receipt was read but could not be saved." });
  }
  return NextResponse.json({ ok: true, id: inserted.id });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const { data: row } = await supabaseAdmin
    .from("receipts")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (row?.storage_path) await supabaseAdmin.storage.from("receipts").remove([row.storage_path]);
  const { error } = await supabaseAdmin.from("receipts").delete().eq("id", id);
  if (error) console.error("receipt delete error", error);
  return NextResponse.json({ ok: !error });
}
