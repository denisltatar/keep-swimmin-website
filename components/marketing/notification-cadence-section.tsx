"use client";

import { useEffect, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = [4, 5, 6, 7, 8] as const;

/** Thumb center positions along the track (percent). */
const THUMB_LEFT_PCT = [8, 29, 50, 71, 92] as const;

/**
 * Explains per-user notification spacing (4–8h) with an animated interval demo.
 */
export function NotificationCadenceSection({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(2);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % HOURS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "user"}>
      <section
        className={cn("relative overflow-hidden bg-transparent pt-12 pb-16 md:pt-14 md:pb-20", className)}
        aria-labelledby="cadence-heading"
      >
        {!reduce && (
          <>
            <motion.div
              className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl"
              aria-hidden
              animate={{ x: [0, 16, 0], opacity: [0.5, 0.75, 0.5] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute -right-16 bottom-1/4 h-56 w-56 rounded-full bg-blue-400/15 blur-3xl"
              aria-hidden
              animate={{ x: [0, -12, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">Your rhythm</p>
            <h2
              id="cadence-heading"
              className="mt-3 text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl"
            >
              Choose how often you hear from us
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
              In Keep Swimmin&apos;, you pick the space between nudges—anywhere from{" "}
              <span className="font-semibold text-slate-800">every 4 hours</span> to{" "}
              <span className="font-semibold text-slate-800">every 8 hours</span>. Enough presence to stay inspired, with
              room to breathe.
            </p>
          </motion.div>

          <motion.div
            className="relative mx-auto mt-12 max-w-lg md:mt-14"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ type: "spring", damping: 24, stiffness: 280, delay: 0.05 }}
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-sky-100/90 bg-white/85 p-6 shadow-[0_24px_60px_-28px_rgba(14,116,144,0.18)] ring-1 ring-white/70 backdrop-blur-md md:p-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(56,189,248,0.14),transparent_50%)]"
                aria-hidden
              />

              <div className="relative flex items-center justify-center gap-2 text-sky-700">
                <Bell className="h-4 w-4 shrink-0 md:h-5 md:w-5" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-600/90 md:text-sm">
                  Time between quotes
                </p>
              </div>

              <div className="relative mx-auto mt-10 max-w-md md:mt-12">
                <div className="relative h-28 md:h-32">
                  <div
                    className="absolute left-[8%] right-[8%] top-[46%] h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-100 via-sky-200/90 to-blue-100 shadow-inner"
                    aria-hidden
                  />

                  {HOURS.map((h, i) => (
                    <div
                      key={h}
                      className="absolute top-[46%] -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${THUMB_LEFT_PCT[i]}%` }}
                    >
                      <motion.div
                        className="mx-auto h-4 w-px rounded-full bg-sky-300/90 md:h-5"
                        animate={
                          !reduce && i === activeIdx
                            ? { scaleY: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }
                            : { scaleY: 1, opacity: i === activeIdx ? 1 : 0.45 }
                        }
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  ))}

                  <motion.div
                    className="absolute top-[46%] z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-600/30 md:h-16 md:w-16"
                    aria-hidden
                    initial={false}
                    animate={{ left: `${THUMB_LEFT_PCT[reduce ? 2 : activeIdx]}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 260 }}
                  >
                    <span className="text-2xl leading-none drop-shadow-sm md:text-[1.75rem]" aria-hidden>
                      🐋
                    </span>
                  </motion.div>
                </div>

                <div className="relative mt-1 h-16 md:h-[4.5rem]">
                  {HOURS.map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 top-0 w-16 -translate-x-1/2 text-center md:w-20"
                      style={{ left: `${THUMB_LEFT_PCT[i]}%` }}
                    >
                      <p
                        className={cn(
                          "text-sm font-bold tabular-nums md:text-base",
                          i === activeIdx ? "text-sky-700" : "text-slate-400",
                        )}
                      >
                        {h}h
                      </p>
                      {h === 4 && (
                        <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400 md:text-[11px]">
                          Steadier drip
                        </p>
                      )}
                      {h === 8 && (
                        <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400 md:text-[11px]">
                          More air
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className="relative mt-8 text-center text-xs leading-relaxed text-slate-500 md:mt-10 md:text-sm">
                Your choice stays inside this band—so you always know the earliest and latest a new line might land.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
