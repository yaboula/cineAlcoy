import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cinema — Descubre y reproduce películas y series",
  description:
    "Explora el catálogo de películas y series más completo. Busca, descubre y reproduce contenido al instante.",
  keywords: ["películas", "series", "streaming", "cine", "cinema"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
