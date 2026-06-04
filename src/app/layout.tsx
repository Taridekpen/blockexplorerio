import { AdBanner } from "@/components/AdBanner";
import { Header } from "@/components/Header";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlockExplorer — Bitcoin & Ethereum",
  description:
    "Multi-chain block explorer with live on-chain data for Bitcoin and Ethereum",
  icons: {
    icon: [],
    apple: [],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 pb-[env(safe-area-inset-bottom)]">
        <Header />
        <AdBanner slot="top" />
        <main className="flex flex-1 flex-col">{children}</main>
        <AdBanner slot="bottom" />
      </body>
    </html>
  );
}
