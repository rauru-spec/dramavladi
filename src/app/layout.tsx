import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";
import { auth } from "@/lib/auth";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pasmiño Drama",
    template: "%s | Pasmiño Drama",
  },
  description: "Novelas reflexivas en capítulos cortos. Suscríbete y disfruta contenido emocional en español.",
  keywords: ["novelas", "drama", "series", "capítulos", "español"],
  openGraph: {
    type: "website",
    locale: "es_MX",
    title: "Pasmiño Drama",
    description: "Novelas reflexivas en capítulos cortos",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
