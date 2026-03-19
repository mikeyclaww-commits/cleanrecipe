import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CleanRecipe — Paste any URL, get just the recipe",
  description:
    "No more scrolling past life stories and ads. CleanRecipe extracts recipes from any website in seconds. Save, organize, and cook.",
  openGraph: {
    title: "CleanRecipe — Paste any URL, get just the recipe",
    description:
      "AI-powered recipe extraction. Paste a URL, get a clean recipe. No ads, no stories, no bloat.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
