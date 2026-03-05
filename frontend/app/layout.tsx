import type { Metadata } from "next";
import { Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aharam High Standard College | அகரம் உயர் நிலைக் கல்லூரி",
  description: "Quality-driven tuition center in Jaffna, Sri Lanka. Two centers at Kokuvil and Mallakam.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ta" className="h-full scroll-smooth">
      <body className={`${notoSansTamil.className} h-full bg-white text-slate-900 antialiased`}>
        <I18nProvider>
          <ToastProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
