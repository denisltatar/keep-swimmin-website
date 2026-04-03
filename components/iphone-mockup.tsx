"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { publicAsset } from "@/lib/base-path";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function IPhoneMockup({ className }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("relative mx-auto flex justify-center", className)}
      animate={
        reduce
          ? undefined
          : {
              rotateY: [0, 2, 0, -2, 0],
              y: [0, -4, 0, 4, 0],
            }
      }
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{ perspective: 1200 }}
    >
      <div
        className={cn(
          "relative w-full max-w-[280px] md:max-w-[300px]",
          "rounded-[2.5rem] border border-slate-800 bg-slate-900 p-2 shadow-2xl",
        )}
      >
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" aria-hidden />
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-slate-50 to-sky-50">
          <Image
            src={publicAsset("/images/screenshot.png")}
            alt="Keep Swimmin app preview"
            width={540}
            height={1140}
            className="h-auto w-full object-cover object-top"
            sizes="(max-width: 768px) 260px, 280px"
            priority
          />
          <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-slate-900/20" aria-hidden />
        </div>
      </div>
    </motion.div>
  );
}
