import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { publicAsset } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of the Keep Swimmin' app.",
};

export default function TermsPage() {
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
        <div className="mb-12 text-center md:mb-14">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-sky-500/20">
            <FileText className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span>Legal</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-800 md:text-5xl">Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: April 1, 2026</p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-[var(--shadow-card)] md:p-10">
          <div className="space-y-5 text-[15px] leading-relaxed text-slate-600 md:text-base">
            <p>
              These Terms of Service govern your use of the Keep Swimmin&apos; mobile application. By using the app, you
              agree to these terms and our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-sky-600 underline decoration-sky-300/50 underline-offset-2 hover:text-sky-700"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the
              revised terms.
            </p>
            <p>
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:support@keepswimmin.com"
                className="font-semibold text-sky-600 underline decoration-sky-300/50 underline-offset-2 hover:text-sky-700"
              >
                support@keepswimmin.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
