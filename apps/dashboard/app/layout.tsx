// apps/dashboard/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShowMe Studio",
  description: "Gérez vos micro-démos interactives contextuelles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full antialiased bg-zinc-950 text-zinc-200">
        {children}
      </body>
    </html>
  );
}