"use client";

import { motion } from "framer-motion";
import { MarketingQuoteNotificationCarousel } from "@/components/marketing/ios-quote-notification";
import { cn } from "@/lib/utils";

/**
 * Standalone band: headline + full notification fly-in / out carousel (always on when motion is allowed).
 */
export function QuoteNotificationShowcaseSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "border-t border-zinc-200/80 bg-white py-16 md:py-20",
        className,
      )}
      aria-labelledby="quote-showcase-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">In motion</p>
          <h2
            id="quote-showcase-heading"
            className="mt-2.5 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl"
          >
            Quotes that drop in—and glide away
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">
            Same motion you get after a theme is saved: each line arrives, lingers, then makes room for the next.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 max-w-md md:mt-14">
          <MarketingQuoteNotificationCarousel enabled className="max-w-none" />
        </div>
      </div>
    </section>
  );
}
