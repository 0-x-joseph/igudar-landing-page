import type { Metadata } from "next";
import { Public_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

// Display serif for hero titles only, never for numbers.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
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
    "theme-color": "#F7F5EF",
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
      className={`${publicSans.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased font-sans bg-card text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
