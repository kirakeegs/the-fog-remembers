import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "雾会记得 - The Fog Remembers",
  description: "原创心理恐怖 roguelite：在灰洄镇的雾中下沉、搜证、完成仪式并活下去。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
