import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Analise Funnelova — AI Agent",
  description: "Chat with Analise Funnelova, your AI funnel analysis agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${montserrat.variable} h-full`}>
      <body className="h-full font-[family-name:var(--font-montserrat)]">
        {children}
      </body>
    </html>
  );
}
