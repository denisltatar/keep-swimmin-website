"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  {
    q: "What is Keep Swimmin'?",
    a: "A story-oriented motivation app: start as a baby whale and grow by collecting daily quotes and building habits.",
  },
  {
    q: "Is the app free?",
    a: "You can download from the App Store. Any subscription or in-app details are shown in the store listing.",
  },
  {
    q: "How do I get support?",
    a: "Email us at support@keepswimmin.com and we will get back to you as soon as we can.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 md:py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">FAQ</h2>
        <p className="mt-3 text-lg text-slate-600">Quick answers about the app.</p>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white/50 shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-slate-800 transition-colors hover:bg-white/80 md:px-6 md:py-5"
              >
                <span className="font-semibold">{item.q}</span>
                <ChevronDown
                  className={cn("h-5 w-5 shrink-0 text-sky-500 transition-transform", isOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="border-t border-slate-100 px-5 py-4 text-slate-600 md:px-6">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="mt-10 rounded-2xl border border-sky-200 bg-sky-50/80 p-6 text-sm text-slate-700 md:p-8">
        <p className="font-semibold text-slate-800">Wellness note</p>
        <p className="mt-2 leading-relaxed">
          Keep Swimmin&apos; is for motivation and personal growth. It is not a substitute for professional medical or mental
          health care. If you are in crisis, contact local emergency services or a crisis line in your area.
        </p>
      </div>
    </section>
  );
}
