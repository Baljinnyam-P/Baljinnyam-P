import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Baljinnyam Puntsagnorov | Full Stack / AI Engineer",
  description:
    "Baljinnyam Puntsagnorov is a full stack and AI engineer building production AI systems, RAG and LLM pipelines, evaluation and observability tooling, and distributed, event-driven backends across fintech and enterprise AI.",
  openGraph: {
    title: "Baljinnyam Puntsagnorov | Full Stack / AI Engineer",
    description:
      "Production AI systems, RAG and LLM evaluation, and distributed backends handling thousands of daily transactions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baljinnyam Puntsagnorov | Full Stack / AI Engineer",
    description:
      "Production AI systems, RAG and LLM evaluation, and distributed backends handling thousands of daily transactions.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
