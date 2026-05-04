import type { Metadata } from "next";
import { Lobster } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { publicAsset } from "@/lib/base-path";

const previewTitle = "Keep Swimmin' - Custom AI-generated quotes";
const previewDescription =
  "Create AI-built themes, get daily motivation that matches your mood, and grow your whale as you stay consistent.";
const previewImage = "/images/Screenshot%202026-05-04%20at%206.45.30%E2%80%AFPM.png";

const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lobster",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://keep-swimmin-app-website.vercel.app"),
  title: {
    default: "Keep Swimmin' — Custom AI-generated quotes",
    template: "%s | Keep Swimmin'",
  },
  description:
    "Create your own motivation theme with AI and get daily quotes that match it. Stay motivated and Keep Swimmin'!",
  openGraph: {
    title: previewTitle,
    description: previewDescription,
    url: "/",
    siteName: "Keep Swimmin'",
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: "Keep Swimmin' ocean-themed motivation app preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: previewTitle,
    description: previewDescription,
    images: [previewImage],
  },
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
