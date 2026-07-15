import type { Metadata } from "next";
import { Fraunces, Noto_Serif_TC, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal"],
});
// Fraunces 不支援中文字，中文標題會 fallback 到系統字體，導致手機/桌機粗體效果不一致。
// 補一套有明確粗細字重的中文襯線字體，讓中文標題在所有裝置上都用同一套字體檔案顯示。
const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  variable: "--font-noto-serif-tc",
  weight: ["500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "家具品牌";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "職人工藝、質感簡約的家具選物，為你的空間找到合適的一件。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className={`${fraunces.variable} ${notoSerifTC.variable} ${inter.variable} ${mono.variable}`}>
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
