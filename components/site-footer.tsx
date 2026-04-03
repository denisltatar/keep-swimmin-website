import Image from "next/image";
import Link from "next/link";
import { publicAsset } from "@/lib/base-path";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/30 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Image
              src={publicAsset("/images/whale.png")}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-md object-contain"
              style={{ width: "auto", height: "auto" }}
            />
            <span>Keep Swimmin&apos;</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <Link href="/terms" className="transition-colors hover:text-sky-600">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-sky-600">
              Privacy Policy
            </Link>
          </nav>
        </div>
        <p className="mt-4 border-t border-slate-200 pt-4 text-center text-sm text-slate-500 sm:text-left">
          &copy; {year}
          {' '}
          Keep Swimmin&apos;. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
