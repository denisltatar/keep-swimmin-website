"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { publicAsset } from "@/lib/base-path";

const APP_STORE =
  "https://apps.apple.com/us/app/keep-swimmin-ai-motivation/id6761438239";

export function MobileDownloadBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-100/80 bg-white/95 px-4 pt-2.5 backdrop-blur-md md:hidden pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      <a
        href={APP_STORE}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto flex max-w-md items-center justify-center gap-3"
      >
        <Image
          src={publicAsset("/images/app-store-badge.svg")}
          alt="Download on the App Store"
          width={135}
          height={40}
          className="h-10 w-auto"
        />
      </a>
    </div>
  );
}
