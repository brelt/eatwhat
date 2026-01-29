import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "本周吃什么 | EatWhat AU - 智能规划一周饮食",
  description: "根据澳洲超市优惠和您的饮食偏好，智能生成一周食谱。比较Woolworths、Coles、ALDI价格，吃得健康又省钱。",
  keywords: "澳洲超市,食谱规划,价格比较,Woolworths,Coles,ALDI,中餐,meal planning,grocery deals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
