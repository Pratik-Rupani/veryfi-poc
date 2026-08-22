export type CapturedImage = {
  fileName: string;
  contentType: string;
  base64: string;
  previewUrl: string;
};

const MAX_EDGE = 1800;

async function loadBitmap(source: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return await createImageBitmap(source);
  }
  const url = URL.createObjectURL(source);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not read that image."));
      image.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

function toBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

export function canvasToCaptured(canvas: HTMLCanvasElement, fileName: string): CapturedImage {
  const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
  return {
    fileName,
    contentType: "image/jpeg",
    base64: toBase64(dataUrl),
    previewUrl: dataUrl,
  };
}

export function drawScaled(
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process that image.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function fileToCaptured(file: File): Promise<CapturedImage> {
  const bitmap = await loadBitmap(file);
  const width = "width" in bitmap ? bitmap.width : 0;
  const height = "height" in bitmap ? bitmap.height : 0;
  const canvas = drawScaled(bitmap as CanvasImageSource, width, height);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
  return canvasToCaptured(canvas, file.name || "receipt.jpg");
}
