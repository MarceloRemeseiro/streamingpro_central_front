import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavWrapper from "@/components/NavWrapper";
import { AuthProvider } from "@/components/AuthProvider";

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
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background dark:bg-background-dark">
            <NavWrapper />
            <main className="py-4">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
