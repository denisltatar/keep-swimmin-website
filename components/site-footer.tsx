import Image from "next/image";
import Link from "next/link";
import { publicAsset } from "@/lib/base-path";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-transparent backdrop-blur-[2px]">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Image
              src={publicAsset("/images/whale.png")}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-md object-contain"
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
        <p className="mt-4 border-t border-sky-100/25 pt-4 text-center text-sm text-slate-500 sm:text-left">
          &copy; {year} Thoughtful Code. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
