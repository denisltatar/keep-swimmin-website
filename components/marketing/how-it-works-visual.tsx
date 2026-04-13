"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { MarketingQuoteNotificationCarousel } from "@/components/marketing/ios-quote-notification";
import { MARKETING_DEMO_THEME_DESCRIPTION, MARKETING_DEMO_THEME_NAME } from "@/lib/marketing-demo-copy";
import { cn } from "@/lib/utils";

const DEMO_TITLE = MARKETING_DEMO_THEME_NAME;
const DEMO_DESCRIPTION = MARKETING_DEMO_THEME_DESCRIPTION;

const TITLE_MS = 72;
const PAUSE_AFTER_TITLE_MS = 560;
const DESC_MS = 26;
const PAUSE_BEFORE_GENERATE_MS = 720;

/** Scroll / layout springs for this section — softer than default marketing springs */
const sectionReveal = { type: "spring" as const, damping: 34, stiffness: 190, mass: 0.9 };

const panelCrossfade = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};
const GENERATING_MS = 1400;
const SUCCESS_MS = 3200;
const LOOP_GAP_MS = 2000;

function Cursor({ visible }: { visible: boolean }) {
  return (
    <span
      className={cn(
        "ml-px inline-block min-h-[1em] w-0.5 translate-y-px rounded-full bg-sky-500 align-baseline",
        visible ? "animate-pulse opacity-100" : "opacity-0",
      )}
      aria-hidden
    />
  );
}

function useDemoTypewriter(reduce: boolean) {
  const [titleLen, setTitleLen] = useState(0);
  const [descLen, setDescLen] = useState(0);
  const [phase, setPhase] = useState<"idle" | "generating" | "success">("idle");
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const runSequence = useCallback(() => {
    clearTimers();
    setTitleLen(0);
    setDescLen(0);
    setPhase("idle");

    let t = 0;
    for (let i = 1; i <= DEMO_TITLE.length; i++) {
      t += TITLE_MS;
      schedule(() => setTitleLen(i), t);
    }
    t += PAUSE_AFTER_TITLE_MS;
    for (let j = 1; j <= DEMO_DESCRIPTION.length; j++) {
      t += DESC_MS;
      schedule(() => setDescLen(j), t);
    }
    t += PAUSE_BEFORE_GENERATE_MS;
    schedule(() => setPhase("generating"), t);
    t += GENERATING_MS;
    schedule(() => setPhase("success"), t);
    t += SUCCESS_MS;
    schedule(() => {
      setTitleLen(0);
      setDescLen(0);
      setPhase("idle");
    }, t);
    t += LOOP_GAP_MS;
    schedule(() => runSequence(), t);
  }, [clearTimers, schedule]);

  useEffect(() => {
    if (reduce) {
      clearTimers();
      setTitleLen(DEMO_TITLE.length);
      setDescLen(DEMO_DESCRIPTION.length);
      setPhase("success");
      return;
    }
    runSequence();
    return () => clearTimers();
  }, [reduce, runSequence, clearTimers]);

  return { titleLen, descLen, phase };
}

function visualStepFromState(
  titleComplete: boolean,
  descComplete: boolean,
  phase: "idle" | "generating" | "success",
): 1 | 2 | 3 {
  if (!titleComplete) return 1;
  if (!descComplete || phase === "idle") return 2;
  return 3;
}

function StepRow({
  n,
  title,
  description,
  active,
  isLast,
}: {
  n: number;
  title: string;
  description: string;
  active: boolean;
  isLast: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-8 last:pb-0 md:gap-5 md:pb-10">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold shadow-md transition-[color,box-shadow,background,transform,border-color] duration-500 ease-out md:h-11 md:w-11 md:text-sm",
            active
              ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/35 ring-2 ring-white"
              : "border border-sky-100/90 bg-white/90 text-slate-400 shadow-sm",
          )}
        >
          {n}
        </div>
        {!isLast && (
          <div
            className={cn(
              "mt-2 h-8 w-0.5 rounded-full transition-colors duration-500 ease-out md:h-10",
              active ? "bg-gradient-to-b from-sky-400 to-sky-100/80" : "bg-sky-100/90",
            )}
            aria-hidden
          />
        )}
      </div>
      <div className="min-w-0 pt-1 md:pt-1.5">
        <p
          className={cn(
            "text-[15px] font-semibold leading-snug transition-colors duration-500 ease-out md:text-base",
            active ? "text-slate-900" : "text-slate-600",
          )}
        >
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500 transition-colors duration-500 ease-out">
          {description}
        </p>
      </div>
    </li>
  );
}

function FlowBeam({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto flex h-14 w-px items-center justify-center md:h-16" aria-hidden>
      <div className="absolute inset-y-0 w-1 rounded-full bg-gradient-to-b from-sky-200/50 via-sky-300/40 to-blue-100/60" />
      {!reduce && (
        <motion.div
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
          animate={active ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.32 }}
          transition={
            active
              ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          }
        />
      )}
    </div>
  );
}

function QuotesPreviewLoadingSkeleton({ phase }: { phase: "waiting" | "writing" }) {
  return (
    <div className="space-y-2.5">
      <div className="flex gap-3 rounded-2xl border border-sky-100/90 bg-gradient-to-br from-white to-sky-50/50 px-4 py-3.5 shadow-sm ring-1 ring-sky-100/40">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-sky-100 [animation-duration:1.6s]" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="h-2 w-14 animate-pulse rounded-full bg-sky-200/80 [animation-duration:1.6s]" />
          <div className="h-2 w-full animate-pulse rounded-full bg-sky-100 [animation-duration:1.6s]" />
          <div className="h-2 w-[85%] animate-pulse rounded-full bg-sky-100 [animation-duration:1.6s]" />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          className="text-center text-xs font-medium text-sky-600/80 md:text-left"
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {phase === "writing" ? "Writing lines…" : "Waiting for your theme…"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function NotificationPreviewPanel({
  showGenerating,
  showSuccess,
  reduce,
}: {
  showGenerating: boolean;
  showSuccess: boolean;
  reduce: boolean;
}) {
  const quotesEnabled = showSuccess || Boolean(reduce);
  const quotesPanelKey = showSuccess ? "quotes" : "loading";
  const loadingPhase = showGenerating ? "writing" : "waiting";

  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600/90 md:text-left">
        Your quotes
      </p>

      {/* Fixed height so the How it works block doesn’t jump when demo phases change */}
      <div className="relative min-h-[240px] md:min-h-[260px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={quotesPanelKey}
            className={cn(quotesPanelKey === "quotes" && "overflow-visible pt-1")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={panelCrossfade}
          >
            {quotesPanelKey === "loading" && (
              <QuotesPreviewLoadingSkeleton phase={loadingPhase} />
            )}
            {quotesPanelKey === "quotes" && (
              <MarketingQuoteNotificationCarousel enabled={quotesEnabled} gentleEntrance />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Step-by-step visual: theme form → notifications / quotes (single marketing section).
 */
export function HowItWorksVisualSection({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { titleLen, descLen, phase } = useDemoTypewriter(Boolean(reduce));

  const titleSlice = DEMO_TITLE.slice(0, titleLen);
  const descSlice = DEMO_DESCRIPTION.slice(0, descLen);
  const titleComplete = titleLen >= DEMO_TITLE.length;
  const descComplete = descLen >= DEMO_DESCRIPTION.length;
  const showTitleCursor = !reduce && !titleComplete && phase === "idle";
  const showDescCursor = !reduce && titleComplete && !descComplete && phase === "idle";
  const formReady = descComplete && phase === "idle";
  const showGenerating = phase === "generating";
  const showSuccess = phase === "success";

  const step = useMemo(
    () => visualStepFromState(titleComplete, descComplete, phase),
    [titleComplete, descComplete, phase],
  );

  const stepsMeta = [
    {
      title: "One-word theme",
      description: "A name you'll remember—your anchor for this vibe.",
    },
    {
      title: "Your situation",
      description: "A few honest lines so the quotes aren't generic.",
    },
    {
      title: "Quotes arrive",
      description: "Short lines show up as notifications you can act on.",
    },
  ];

  const beamActive = showGenerating || showSuccess;

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "user"}>
      <section
        className={cn("relative overflow-hidden bg-transparent pt-16 pb-14 md:pt-24 md:pb-20", className)}
        aria-labelledby="how-it-works-heading"
      >
        {!reduce && (
          <>
            <motion.div
              className="pointer-events-none absolute -left-28 top-1/4 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl"
              aria-hidden
              animate={{ x: [0, 16, 0], y: [0, 10, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute -right-24 bottom-1/3 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"
              aria-hidden
              animate={{ x: [0, -12, 0], y: [0, -9, 0] }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={sectionReveal}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">How it works</p>
            <h2
              id="how-it-works-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl md:leading-tight"
            >
              Theme in, quotes out
            </h2>
            <p className="mt-3 text-base text-slate-600 md:text-lg">
              Steps on the left—watch the demo build on the right.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)]"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...sectionReveal, delay: 0.06 }}
          >
            <nav aria-label="Steps in the app" className="lg:max-w-sm">
              <ol className="relative">
                {stepsMeta.map((s, i) => (
                  <StepRow
                    key={s.title}
                    n={i + 1}
                    title={s.title}
                    description={s.description}
                    active={step === i + 1}
                    isLast={i === stepsMeta.length - 1}
                  />
                ))}
              </ol>
            </nav>

            <div className="min-w-0 lg:self-start">
              <div className="rounded-[1.75rem] border border-sky-100/80 bg-white/70 p-1 shadow-[0_20px_50px_-24px_rgba(14,116,144,0.18)] ring-1 ring-white/80 backdrop-blur-md md:p-1.5">
                <motion.div
                  className="relative overflow-hidden rounded-[1.35rem] border border-sky-100/60 bg-white p-5 md:p-6"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={sectionReveal}
                >
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/25"
                    aria-hidden
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-600/90">New theme</p>
                      <span className="rounded-full bg-sky-100/90 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-200/60">
                        Demo
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                          htmlFor="howitworks-theme-title"
                        >
                          Name
                        </label>
                        <div
                          id="howitworks-theme-title"
                          className={cn(
                            "mt-1.5 min-h-[46px] rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-lg font-semibold tracking-tight text-slate-900 shadow-inner shadow-sky-950/5 transition-[border-color,box-shadow] duration-500 ease-out",
                            titleComplete && "border-sky-200/90 ring-1 ring-sky-100/80",
                          )}
                          aria-live="polite"
                        >
                          <span className={cn(!titleSlice && "text-slate-400")}>{titleSlice || "One word"}</span>
                          <Cursor visible={showTitleCursor} />
                        </div>
                      </div>

                      <div>
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                          htmlFor="howitworks-theme-desc"
                        >
                          Context
                        </label>
                        <div
                          id="howitworks-theme-desc"
                          className={cn(
                            "mt-1.5 min-h-[128px] rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700 shadow-inner shadow-sky-950/5 transition-[border-color,box-shadow,opacity] duration-500 ease-out md:min-h-[118px]",
                            descComplete && phase === "idle" && "border-sky-200/90 ring-1 ring-sky-100/80",
                            !titleComplete && "opacity-40",
                          )}
                          aria-live="polite"
                        >
                          <span className={cn(!descSlice && titleComplete && "text-slate-400")}>
                            {descSlice || (titleComplete ? "Plain language is enough." : "…")}
                          </span>
                          <Cursor visible={showDescCursor} />
                        </div>
                      </div>

                      <div className="pt-0.5">
                        <div
                          className={cn(
                            "flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold shadow-md transition-[color,background,box-shadow] duration-500 ease-out",
                            formReady || showGenerating || showSuccess
                              ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-slate-900/20"
                              : "bg-slate-100 text-slate-400 shadow-none",
                          )}
                        >
                          {showGenerating && (
                            <span className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300/70" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-200" />
                              </span>
                              Building…
                            </span>
                          )}
                          {showSuccess && <span>Saved</span>}
                          {!showGenerating && !showSuccess && <span>Get quotes</span>}
                        </div>
                      </div>
                  </div>
                  </div>
                </motion.div>
              </div>

              <FlowBeam active={beamActive} />

              <NotificationPreviewPanel
                showGenerating={showGenerating}
                showSuccess={showSuccess}
                reduce={Boolean(reduce)}
              />
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
