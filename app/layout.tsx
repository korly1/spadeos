import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPADE OS — Strategy Execution for Scaling Companies",
  description:
    "Your organization is designed for humans who don't exist. SPADE OS closes the gap between strategy and execution using behavioral science and systems thinking.",
  openGraph: {
    title: "SPADE OS",
    description:
      "Close the gap between strategy and execution. Built for real humans, not rational actors.",
    siteName: "SPADE OS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="bg-[#080c10] text-white antialiased">{children}</body>
    </html>
  );
}
