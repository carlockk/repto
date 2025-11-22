import type { Metadata } from "next";
import "./globals.css";
import { ReactNode, Suspense } from "react";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Repto - Reparto",
  description: "Módulo de repartidores conectado al sistema de seguimiento"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={<div className="p-4">Cargando...</div>}>
            <main className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
              <div className="w-full max-w-md p-4">{children}</div>
            </main>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
