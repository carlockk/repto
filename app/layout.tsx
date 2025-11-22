import type { Metadata } from "next";
import "./globals.css";
import { ReactNode, Suspense } from "react";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Repto - Reparto",
  description: "Modulo de repartidores conectado al sistema de seguimiento",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icon-192.png"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={<div className="p-4">Cargando...</div>}>
            <main className="min-h-screen flex items-start justify-center bg-slate-100 dark:bg-slate-900 py-6">
              <div className="w-full max-w-md p-4">{children}</div>
            </main>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
