import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منظومة الوادي SMS — لوحة التحكم",
  description: "نظام استقبال وإدارة رسائل SMS ورموز التحقق — منظومة الوادي",
  keywords: "SMS, OTP, رموز تحقق, منظومة الوادي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}