import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "el web",
  description: "lil demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />

        {children}

        {/* ✅ Proper PayPal SDK load */}
        <Script
          src="https://www.paypal.com/sdk/js?client-id=ARMOVu-muWW_zjAYYq6gDqWBh02yUxxnJHn8rdqABuenXEvzFrHt6EqKooSKFOkXZ7DPXrLTNvlAnZ29&currency=USD&components=buttons"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}