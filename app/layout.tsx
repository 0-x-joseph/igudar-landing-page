import type { Metadata } from "next";
import { Public_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";
import { LIMITS, formatMad } from "@/lib/finance";

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

const TITLE = "IGUDAR — fractional property, simulated honestly";
const DESCRIPTION = `Own a share of a rented Moroccan building, from ${formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}. See every fee, simulate net returns, and join the closed beta. Returns are not guaranteed; not an offer.`;

// Indexing is left at the Next.js default (indexed). Founders: add `robots: { index: false }` if the site should stay hidden until launch.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", siteName: "IGUDAR" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
  icons: {
    icon: "/images/Logo-IGUDAR-2-Photoroom.svg",
    shortcut: "/images/Logo-IGUDAR-2-Photoroom.svg",
    apple: "/images/Logo-IGUDAR-2-Photoroom.svg",
  },
  other: {
    "theme-color": "#0F0C17",
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
      <body className="min-h-full flex flex-col antialiased font-sans bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
