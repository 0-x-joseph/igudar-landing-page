import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "IGUDAR — Invest in Moroccan Real Estate, Share by Share",
  description: "Start with 1,000 MAD. Access vetted, Sharia-compliant properties with full transparency. The smartest way to invest in real estate.",
  icons: {
    icon: "/images/Logo-IGUDAR-2-Photoroom.svg",
    shortcut: "/images/Logo-IGUDAR-2-Photoroom.svg",
    apple: "/images/Logo-IGUDAR-2-Photoroom.svg",
  },
  other: {
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased font-sans bg-white text-slate-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
