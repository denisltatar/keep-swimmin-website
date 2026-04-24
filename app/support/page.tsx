import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bug,
  Clock,
  LifeBuoy,
  Mail,
  Send,
  Shield,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { publicAsset } from "@/lib/base-path";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "developer@thoughtfulcode.io";

export const metadata: Metadata = {
  title: "Support & help",
  description:
    "Get help with Keep Swimmin’: themes, quotes, notifications, subscriptions, and more.",
};

const mailto = (params: { subject: string; body?: string }) => {
  const q = new URLSearchParams();
  q.set("subject", params.subject);
  if (params.body) q.set("body", params.body);
  return `mailto:${SUPPORT_EMAIL}?${q.toString()}`;
};

const faqItems: { id: string; q: string; a: string }[] = [
  {
    id: "what",
    q: "What is Keep Swimmin’?",
    a: "It’s a calm, ocean-themed motivation app. You set themes that reflect where you are right now, and the app returns short AI-generated quotes that feel specific to you—not the same one-size-fits-all line every day.",
  },
  {
    id: "create-theme",
    q: "How do I create a theme?",
    a: "Add a new theme, give it a name you’ll recognize (for example, “No Excuses” or “Keep Going”), then write a few lines about your situation or mindset. That context helps the app shape quotes that land.",
  },
  {
    id: "quotes",
    q: "How do quotes work?",
    a: "The app uses what you’ve shared about a theme to generate fresh lines that match that theme. You can also use the built-in options alongside your own. Saved favorites live in the Growth view so you can reread the ones that stuck.",
  },
  {
    id: "how-often",
    q: "How often do I receive new quotes?",
    a: "New quotes are delivered on a soft rhythm—roughly every four to eight hours, so the app nudges you at a steady pace without flooding your day.",
  },
  {
    id: "notifications",
    q: "Notifications",
    a: "Enable notifications in your phone settings and in the app if prompted. We use them to share new quote drops for your active theme. You can always adjust timing or turn them off in system settings if you need quiet time.",
  },
  {
    id: "subscriptions",
    q: "Subscriptions / Premium",
    a: "Pricing and any premium or subscription features are shown in the App Store listing. Purchases, renewals, and cancellations are managed the same way as other iOS apps—through your Apple ID and App Store subscriptions. Email us if something looks wrong on your account.",
  },
  {
    id: "account",
    q: "Account & sign-in",
    a: "Sign in with the option offered in the app. If you switch devices or can’t get back in, note which sign-in you used, then message us. We can help you reconnect to your themes and saved quotes when possible.",
  },
];

const troubleshootItems: { t: string; s: string }[] = [
  { t: "Quotes aren’t generating or look empty", s: "Check you’re online, the theme has a name and a short description, and try one more time after closing and reopening the app." },
  { t: "Notifications are quiet or missing", s: "Confirm notifications are on for Keep Swimmin’ in iOS Settings, Focus modes aren’t blocking the app, and the app is allowed to refresh in the background if you use that feature." },
  { t: "I expected a different tone", s: "Tweak the theme name or the situation text—small edits can steer the next quotes. You can add another theme to explore a new angle without losing the old one." },
];

const homeCard =
  "rounded-2xl border border-slate-200 bg-white/50 shadow-md transition-shadow hover:shadow-lg";

const panelCard =
  "rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-b from-white via-white to-sky-50/25 p-6 text-center shadow-[var(--shadow-card)] md:p-10";
const innerWell =
  "rounded-2xl border border-sky-100/60 bg-white/40 p-5 text-center ring-1 ring-sky-100/40 backdrop-blur-sm md:text-left";

function SupportIcon({
  className,
  children,
  variant = "sky",
}: {
  className?: string;
  children: ReactNode;
  variant?: "sky" | "rose" | "cyan" | "amber";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md",
        variant === "sky" && "bg-gradient-to-br from-sky-400 to-blue-500 shadow-sky-500/20",
        variant === "rose" && "bg-gradient-to-br from-rose-400 to-rose-500 shadow-rose-500/20",
        variant === "cyan" && "bg-gradient-to-br from-cyan-400 to-sky-500 shadow-cyan-500/20",
        variant === "amber" && "bg-gradient-to-br from-amber-300 to-amber-500 shadow-amber-500/20",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default function SupportPage() {
  return (
    <>
      <header className="border-b border-sky-100/40 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-4 md:py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm text-slate-600 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <Image
              src={publicAsset("/images/whale.png")}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-md object-contain"
            />
            <span className="font-semibold text-slate-700">Back to Keep Swimmin&apos;</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-5 md:py-8" id="top">
        <div className="border-b border-sky-100/50 pb-8 text-center md:pb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">Support</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800 sm:mt-3 sm:text-4xl md:text-5xl">
            How can we help?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:mt-4">
            We&apos;re here to help you get calm, personal encouragement from the app. Scan the topics below, or reach
            out if you&apos;d like a hand from a real person.
          </p>
        </div>

        <div className="mb-10 mt-8 grid gap-4 sm:mb-12 sm:mt-10 sm:grid-cols-3" aria-label="Quick links">
          <a
            href="#faqs"
            className={cn("group p-5 text-left md:p-6", homeCard)}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
              <h2 className="text-lg font-semibold tracking-tight text-slate-800">FAQ</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Themes, quotes, notifications, billing, and account basics in plain language.
            </p>
          </a>
          <a
            href="#contact"
            className={cn("group p-5 text-left md:p-6", homeCard)}
          >
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
              <h2 className="text-lg font-semibold tracking-tight text-slate-800">Email us</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">Tell us what&apos;s going on. We read every message.</p>
          </a>
          <a
            href="#troubleshooting"
            className={cn("group p-5 text-left md:p-6", homeCard)}
          >
            <div className="flex items-center gap-3">
              <Wrench className="h-6 w-6 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
              <h2 className="text-lg font-semibold tracking-tight text-slate-800">Troubleshooting</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">Quick steps when quotes or alerts feel off.</p>
          </a>
        </div>

        <section className="mb-14" id="faqs" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="mb-6 text-center text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl"
          >
            Frequently asked questions
          </h2>
          <ul className="space-y-4" role="list">
            {faqItems.map((item) => (
              <li
                key={item.id}
                className={cn("p-5 text-left md:p-6", homeCard, "hover:shadow-md")}
                id={item.id}
              >
                <h3 className="text-base font-semibold text-slate-800 md:text-lg">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-[15px]">{item.a}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="mb-14 scroll-mt-8"
          id="troubleshooting"
          aria-labelledby="troubleshoot-heading"
        >
          <h2
            id="troubleshoot-heading"
            className="mb-5 text-center text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl"
          >
            Troubleshooting
          </h2>
          <ul className="list-none space-y-3" role="list">
            {troubleshootItems.map((x) => (
              <li key={x.t} className={cn("p-5 text-left md:p-6", homeCard, "hover:shadow-md")}>
                <h3 className="text-base font-semibold text-slate-800">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{x.s}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mb-4 text-center" id="contact" />
        <section className={cn("mb-14 scroll-mt-8", panelCard)} aria-labelledby="contact-team-heading">
          <h2
            id="contact-team-heading"
            className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl md:text-2xl"
          >
            Contact our support team
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 md:text-base">
            Still stuck? We&apos;re a small team and we want real issues sorted. Send a note with what you were doing and
            what you expected to see.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
            <div className={innerWell}>
              <div className="mb-3 flex justify-center md:justify-start">
                <SupportIcon>
                  <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
                </SupportIcon>
              </div>
              <h3 className="font-semibold text-slate-800">Email support</h3>
              <p className="mt-1 text-sm text-slate-600">We usually reply within a couple of business days.</p>
              <a
                href={mailto({ subject: "Keep Swimmin’ – Support request" })}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/15 transition-opacity hover:opacity-95"
              >
                <Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                {SUPPORT_EMAIL}
              </a>
            </div>
            <div className={innerWell}>
              <div className="mb-3 flex justify-center md:justify-start">
                <SupportIcon>
                  <Clock className="h-4 w-4" strokeWidth={2} aria-hidden />
                </SupportIcon>
              </div>
              <h3 className="font-semibold text-slate-800">Response time</h3>
              <p className="mt-1 text-sm text-slate-600">We read messages in order and get back as soon as we can.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Monday–Sunday: we aim to reply within one to two business days. For urgent device safety, use the emergency info below.
              </p>
            </div>
          </div>
        </section>

        <section
          className={cn("mb-14 scroll-mt-8", panelCard)}
          aria-labelledby="report-heading"
          id="report"
        >
          <h2
            id="report-heading"
            className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl md:text-2xl"
          >
            Report an issue
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
            If something&apos;s broken or you have an idea that would make the app kinder to use, tell us. Pick the
            category that&apos;s closest—we&apos;ll read the full message.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="text-center sm:text-left">
              <div className="mb-2 flex justify-center sm:justify-start">
                <SupportIcon variant="rose">
                  <Bug className="h-5 w-5" strokeWidth={2} aria-hidden />
                </SupportIcon>
              </div>
              <h3 className="font-semibold text-slate-800">Bug or crash</h3>
              <p className="mt-1 text-sm text-slate-600">Crashes, failed quotes, or error screens you can repeat.</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="mb-2 flex justify-center sm:justify-start">
                <SupportIcon variant="amber">
                  <Zap className="h-5 w-5" strokeWidth={2} aria-hidden />
                </SupportIcon>
              </div>
              <h3 className="font-semibold text-slate-800">Speed &amp; reliability</h3>
              <p className="mt-1 text-sm text-slate-600">Loading delays, missed notifications, or shaky network behavior.</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="mb-2 flex justify-center sm:justify-start">
                <SupportIcon variant="cyan">
                  <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />
                </SupportIcon>
              </div>
              <h3 className="font-semibold text-slate-800">Feature request</h3>
              <p className="mt-1 text-sm text-slate-600">Ways to make quotes, themes, or Growth more helpful.</p>
            </div>
          </div>
          <a
            href={mailto({
              subject: "Keep Swimmin’ – Report",
              body: "What I was doing:\n\nWhat I expected:\n\nWhat I saw (device, iOS version, screenshots if you have them):\n",
            })}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            <LifeBuoy className="h-4 w-4" strokeWidth={2} aria-hidden />
            Open email to report
          </a>
        </section>

        <section className="mb-10" aria-labelledby="more-resources-heading" id="resources">
          <h2
            id="more-resources-heading"
            className="mb-5 text-center text-2xl font-semibold tracking-tight text-slate-800"
          >
            Additional resources
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/privacy"
              className={cn("group flex flex-col p-5 text-left transition-shadow md:p-6", homeCard)}
            >
              <div className="mb-1 flex items-center gap-3">
                <Shield className="h-6 w-6 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
                <span className="text-base font-semibold text-slate-800">Privacy policy</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">How we treat data in and around the app.</p>
            </Link>
            <Link
              href="/terms"
              className={cn("group flex flex-col p-5 text-left transition-shadow md:p-6", homeCard)}
            >
              <div className="mb-1 flex items-center gap-3">
                <BookOpen className="h-6 w-6 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
                <span className="text-base font-semibold text-slate-800">Terms of service</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Rules and expectations for using Keep Swimmin’.</p>
            </Link>
          </div>
        </section>

        <div
          className="mb-2 rounded-2xl border border-sky-200/60 bg-sky-50/70 p-4 text-left md:p-5"
          role="note"
          id="safety"
        >
          <div className="flex items-start gap-3">
            <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" strokeWidth={2} aria-hidden />
            <div>
              <p className="text-sm font-semibold text-slate-800">Important: not a crisis or medical service</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Keep Swimmin’ is for motivation, reflection, and day-to-day encouragement. It does not provide medical
                or mental health treatment. If you or someone else is in immediate danger, call{" "}
                <strong>911</strong> (U.S.) or your local emergency number, or the{" "}
                <strong>988</strong> Suicide &amp; Crisis Lifeline in the U.S. by calling or texting{" "}
                <strong>988</strong>. Use whatever crisis resources your country provides if you are outside the U.S.
              </p>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
