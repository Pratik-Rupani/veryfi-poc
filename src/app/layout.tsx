import type { Metadata, Viewport } from "next";
import "../styles.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "Receiptly - Scan Receipts with Your Camera",
  description: "Snap or import a receipt and get structured expense data automatically.",
  icons: { icon: "/favicon.png", apple: "/icons/app-icon-512.png" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Receiptly - Scan Receipts with Your Camera",
    description: "Snap or import a receipt and get the data parsed automatically.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f1720",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" richColors />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
