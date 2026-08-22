"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ImagePlus, Loader2, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/CameraCapture";
import { ReceiptCard } from "@/components/ReceiptCard";
import { fileToCaptured, type CapturedImage } from "@/lib/image";
import { deleteReceipt, listReceipts, scanReceipt } from "@/lib/receipts.functions";

export function ReceiptDashboard() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { data: receipts = [] } = useQuery({ queryKey: ["receipts"], queryFn: listReceipts });
  const scanMutation = useMutation({
    mutationFn: scanReceipt,
    onSuccess: (result) => {
      setPreview(null);
      if (result.ok) {
        toast.success("Receipt scanned and saved");
        void queryClient.invalidateQueries({ queryKey: ["receipts"] });
      } else toast.error(result.error);
    },
    onError: () => {
      setPreview(null);
      toast.error("Something went wrong while scanning.");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteReceipt,
    onSuccess: () => {
      toast.success("Receipt deleted");
      void queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
  const handleImage = (image: CapturedImage) => {
    setCameraOpen(false);
    setPreview(image.previewUrl);
    scanMutation.mutate(image);
  };
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      handleImage(await fileToCaptured(file));
    } catch {
      toast.error("That file could not be read as an image.");
    }
  };
  const busy = scanMutation.isPending;
  const monthTotal = receipts.reduce((sum, receipt) => sum + (receipt.total ?? 0), 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-28 pt-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ReceiptText className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Receiptly</h1>
          <p className="text-sm text-muted-foreground">Scan a receipt, get the data - no typing.</p>
        </div>
      </header>
      <section className="surface-card mb-6 p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">Captured receipts</p>
          <p className="text-sm text-muted-foreground">{receipts.length}</p>
        </div>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {monthTotal.toFixed(2)}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            total across all scans
          </span>
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button size="lg" disabled={busy} onClick={() => setCameraOpen(true)}>
            <Camera className="size-5" />
            Scan
          </Button>
          <Button
            size="lg"
            variant="secondary"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-5" />
            Browse
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </section>
      {busy ? (
        <section className="surface-card mb-6 flex items-center gap-4 p-4">
          <div className="scan-sweep relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
            {preview ? (
              <img src={preview} alt="Receipt being scanned" className="size-full object-cover" />
            ) : null}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 animate-scanline bg-primary" />
          </div>
          <div>
            <p className="flex items-center gap-2 font-medium">
              <Loader2 className="size-4 animate-spin" />
              Reading your receipt
            </p>
            <p className="text-sm text-muted-foreground">
              Extracting merchant, date, tax and totals...
            </p>
          </div>
        </section>
      ) : null}
      <section className="space-y-3">
        <h2 className="px-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          History
        </h2>
        {receipts.length === 0 && !busy ? (
          <div className="surface-card p-8 text-center">
            <p className="font-medium">No receipts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap Scan to use your camera, or Import a photo from your gallery.
            </p>
          </div>
        ) : null}
        {receipts.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            deleting={deleteMutation.isPending}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </section>
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleImage}
      />
    </main>
  );
}
