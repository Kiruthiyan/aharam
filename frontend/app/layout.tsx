import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";
import { Manrope, Noto_Sans_Tamil } from "next/font/google";

const fontEnglish = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-english",
  display: "swap",
});

const fontTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aharam High Standard College",
  description: "Quality-driven tuition center in Jaffna, Sri Lanka. Two centers at Kokuvil and Mallakam.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontEnglish.variable} ${fontTamil.variable} h-full scroll-smooth`}
      data-lang="en"
    >
      <body className="h-full bg-white text-slate-900 antialiased font-sans">
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
