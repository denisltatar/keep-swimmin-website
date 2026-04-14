import Image from "next/image";
import Link from "next/link";
import { publicAsset } from "@/lib/base-path";

const SITE_TAGLINE = "Custom AI-generated quotes";

export function SiteHeader() {
  return (
    <header className="border-b border-sky-100/40 bg-white/35 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 py-2.5 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-800 transition-opacity hover:opacity-80"
        >
          <Image
            src={publicAsset("/images/whale.png")}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 rounded-md object-contain"
          />
          <span className="font-semibold tracking-tight">Keep Swimmin&apos;</span>
        </Link>
        <span className="hidden text-slate-400 sm:inline" aria-hidden>
          ·
        </span>
        <p className="text-sm font-medium text-slate-600 sm:pl-0">{SITE_TAGLINE}</p>
      </div>
    </header>
  );
}
