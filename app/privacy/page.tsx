import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { PrivacyPolicyContent } from "@/components/privacy/privacy-policy-content";
import { publicAsset } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Keep Swimmin' collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <header className="border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm text-slate-600 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <Image
              src={publicAsset("/images/whale.png")}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-lg object-contain shadow-sm ring-1 ring-slate-200/80"
              style={{ width: "auto", height: "auto" }}
            />
            <span className="font-semibold text-slate-700">Back to Keep Swimmin&apos;</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:py-16">
        <div className="mb-14 text-center md:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-sky-500/20">
            <Shield className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span>Privacy &amp; Security</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-800 md:text-5xl">Privacy Policy</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            Keep Swimmin&apos; (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to
            protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your
            information when you use our mobile application.
          </p>
          <p className="mt-5 text-sm text-slate-500">Last updated: April 1, 2026</p>
        </div>

        <PrivacyPolicyContent />
      </main>
    </>
  );
}
