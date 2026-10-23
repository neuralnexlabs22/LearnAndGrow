import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speak English with Confidence | 8-Week English Learning Course",
  description:
    "An intensive 8-week structured English learning course covering grammar, vocabulary, pronunciation, listening, and everyday conversational fluency.",
  keywords: [
    "English course",
    "8-week English",
    "spoken English",
    "English grammar",
    "vocabulary",
    "pronunciation",
    "conversation practice",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FBF9F5] text-[#1C1917] selection:bg-[#C25E38]/20 selection:text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
