import type { Metadata } from "next";
import { Lobster } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { publicAsset } from "@/lib/base-path";

const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lobster",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://denisltatar.github.io/keep-swimmin-website"),
  title: "Keep Swimmin'",
  description:
    "Create your own motivation theme with AI and get daily quotes that match it. Stay motivated and Keep Swimmin'!",
  icons: {
    icon: publicAsset("/images/whales-group.png"),
    apple: publicAsset("/images/whales-group.png"),
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${lobster.variable}`}
    >
      <body className={`${GeistSans.className} flex min-h-screen flex-col text-slate-800`}>
        <div className="flex flex-1 flex-col bg-gradient-to-b from-sky-50 to-blue-50">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
