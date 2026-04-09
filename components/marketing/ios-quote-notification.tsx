"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { publicAsset } from "@/lib/base-path";
import { cn } from "@/lib/utils";

export type IOSQuoteNotificationCardProps = {
  body: string;
  title?: string;
  time?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Single iOS-style notification row (icon + title + time + body).
 */
export function IOSQuoteNotificationCard({
  body,
  title = "Keep Swimming 🐋",
  time = "now",
  className,
  style,
}: IOSQuoteNotificationCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "border border-zinc-200/90 bg-white shadow-sm",
        className,
      )}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-zinc-50/40 to-transparent"
        aria-hidden
      />
      <div className="relative px-3.5 pb-3.5 pt-3">
        <div className="flex items-center gap-3">
          <div className="relative h-[46px] w-[46px] shrink-0 overflow-hidden rounded-xl ring-1 ring-zinc-200/80">
            <Image
              src={publicAsset("/images/whales-group.png")}
              alt=""
              width={92}
              height={92}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[0.9375rem] font-semibold leading-tight tracking-tight text-zinc-900">{title}</p>
              <span className="shrink-0 pt-0.5 text-[11px] font-medium tabular-nums text-zinc-400">{time}</span>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-zinc-600">{body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Demo quotes; `id` is stable for AnimatePresence keys. */
export const MARKETING_QUOTE_NOTIFICATION_SAMPLES = [
  {
    id: "ocean",
    body: "You don't have to cross the whole ocean today—just keep swimming in your direction.",
    time: "now",
  },
  {
    id: "rest",
    body: "Rest still counts toward the long swim—even when you're mostly treading water. Breathe at the surface before the next lap.",
    time: "2m ago",
  },
  {
    id: "grit",
    body: "Buoy isn't asking you to sprint—small reps still beat big speeches. Here's today's line.",
    time: "9:41 AM",
  },
  {
    id: "current",
    body: "You can't steer the whole tide—only your next stroke. That's enough for today.",
    time: "8:17 AM",
  },
  {
    id: "theme",
    body: "New theme unlocked: calm focus. Here's a line that matches the palette you picked.",
    time: "Yesterday",
  },
  {
    id: "small",
    body: "Tiny forward is still forward—floating counts as motion when the water's rough.",
    time: "6:12 PM",
  },
  {
    id: "depth",
    body: "Depth comes in quiet reps, not loud promises. Swim one more lap when you're ready.",
    time: "11:03 AM",
  },
] as const;

const CYCLE_MS = 8200;

const popInTransition = { type: "spring" as const, damping: 15, stiffness: 410, mass: 0.62 };

const exitEase = [0.32, 0, 0.72, 0] as const;

type CarouselProps = {
  /** When false, shows the first sample without cycling (e.g. before “build” finishes). */
  enabled?: boolean;
  className?: string;
};

/**
 * Cycling lock-screen-style notifications for marketing embeds.
 */
export function MarketingQuoteNotificationCarousel({ enabled = true, className }: CarouselProps) {
  const reduce = useReducedMotion();
  const shouldCycle = !reduce && enabled;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!shouldCycle) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % MARKETING_QUOTE_NOTIFICATION_SAMPLES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [shouldCycle]);

  useEffect(() => {
    if (enabled && !reduce) setActiveIndex(0);
  }, [enabled, reduce]);

  const active = MARKETING_QUOTE_NOTIFICATION_SAMPLES[activeIndex] ?? MARKETING_QUOTE_NOTIFICATION_SAMPLES[0];

  const drift = activeIndex % 2 === 0 ? 1 : -1;

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "user"}>
      <div
        className={cn("relative mx-auto w-full max-w-[22rem] overflow-visible", className)}
        style={{ perspective: 1100 }}
      >
        <div className="relative min-h-[160px] overflow-visible py-5 [transform-style:preserve-3d] md:min-h-[156px] md:py-6">
          {reduce || !shouldCycle ? (
            <IOSQuoteNotificationCard
              body={MARKETING_QUOTE_NOTIFICATION_SAMPLES[0].body}
              time={MARKETING_QUOTE_NOTIFICATION_SAMPLES[0].time}
              className="relative"
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{
                  opacity: 0,
                  y: -110,
                  scale: 0.78,
                  rotateX: -22,
                  x: 22 * drift,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                  x: 0,
                  transition: popInTransition,
                }}
                exit={{
                  opacity: 0,
                  y: -100,
                  scale: 1.12,
                  rotateX: 14,
                  x: 28 * drift,
                  transition: { duration: 0.5, ease: exitEase },
                }}
                whileHover={{ y: -4, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 24 } }}
                className="relative origin-top will-change-transform [transform-style:preserve-3d]"
              >
                <IOSQuoteNotificationCard body={active.body} time={active.time} className="relative" />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}
