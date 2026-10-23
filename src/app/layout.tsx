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
  title: "8-Week Full-Stack Web Engineering | Student Course Platform",
  description:
    "An intensive 8-week online learning platform with structured weekly syllabus, private study materials, and direct WhatsApp instructor enrollment.",
  keywords: [
    "online course",
    "8-week course",
    "web engineering",
    "student course",
    "syllabus",
    "learning modules",
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
