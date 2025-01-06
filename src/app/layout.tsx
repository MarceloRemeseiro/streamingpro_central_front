import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavWrapper from "@/components/NavWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StreamingPro",
  description: "Streaming platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <NavWrapper />
          <main className="py-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
