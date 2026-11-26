import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { FloatingWhatsAppButton } from "@/components/whatsapp/FloatingWhatsAppButton";

export const metadata: Metadata = {
  title: "Vaishnavi Classes — Fee Management System",
  description: "Official Portal for Vaishnavi Classes (Since 1996): course admissions, fee collection, installment tracking, and verified receipts.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          {children}
          <FloatingWhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
