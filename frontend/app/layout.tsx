import type { Metadata } from "next";
import { Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aharam Tuition Center",
  description: "High Standard College Tuition Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta" className="h-full">
      <body className={`${notoSansTamil.className} h-full bg-slate-50 text-slate-900`}>{children}</body>
    </html>
  );
}
