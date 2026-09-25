import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/common/Providers";

export const metadata: Metadata = {
  title: "NyayaVoice — Real-Time Multilingual AI Legal Assistant",
  description: "Understand legal documents by talking to them. Real-time document intelligence, clause citations, and interactive legal call assistant for India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="lawai h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#f6f4fb] text-[#161616] selection:bg-[#4451c7] selection:text-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-slate-950"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
