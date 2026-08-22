import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canvasToCaptured, drawScaled, type CapturedImage } from "@/lib/image";

type CameraCaptureProps = {
  open: boolean;
  onClose: () => void;
  onCapture: (image: CapturedImage) => void;
};

export function CameraCapture({ open, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setReady(false);

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setError(
            "Camera access was blocked. Allow camera permission, or import a photo instead.",
          );
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, [open, facingMode]);

  if (!open) return null;

  const shoot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = drawScaled(video, video.videoWidth, video.videoHeight);
    onCapture(canvasToCaptured(canvas, `receipt-${Date.now()}.jpg`));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-muted-foreground">Frame the whole receipt</p>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Switch camera"
            onClick={() =>
              setFacingMode((mode) => (mode === "environment" ? "user" : "environment"))
            }
          >
            <RefreshCw className="size-5" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Close camera" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted autoPlay className="size-full object-cover" />
        <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-dashed border-primary/60" />
        {ready ? (
          <div className="pointer-events-none absolute inset-x-6 top-8 h-0.5 animate-scanline bg-primary" />
        ) : null}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-center px-6 pb-10 pt-6">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full p-0"
          disabled={!ready}
          onClick={shoot}
          aria-label="Capture receipt"
        >
          <Camera className="size-7" />
        </Button>
      </div>
    </div>
  );
}
