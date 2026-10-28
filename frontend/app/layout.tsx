import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniPost AI - Social Media Content Agent",
  description: "AI-Driven Social Media Posting Agent for LinkedIn, Facebook, and Instagram with Real-time Web Search and Human-in-the-Loop review.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
