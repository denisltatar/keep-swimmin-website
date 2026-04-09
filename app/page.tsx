import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Users, Quote, Wand2 } from "lucide-react";
import { IPhoneMockup } from "@/components/iphone-mockup";
import { HowItWorksVisualSection } from "@/components/marketing/how-it-works-visual";
import { QuoteNotificationShowcaseSection } from "@/components/marketing/quote-notification-showcase";
import { FaqSection } from "@/components/marketing/faq-section";
import { publicAsset } from "@/lib/base-path";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <>
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:gap-12 md:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-2xl bg-white/60 p-2 pr-4 shadow-sm ring-1 ring-slate-200/80">
              <Image
                src={publicAsset("/images/white-whale.png")}
                alt="Keep Swimmin'"
                width={64}
                height={64}
                className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-sm sm:h-9 sm:w-9"
                priority
              />
              <span className="text-sm font-medium text-slate-600">AI themes · quotes that feel yours</span>
            </div>
            <h1 className={cn("text-5xl font-semibold tracking-tight text-slate-800 md:text-6xl", "font-[family-name:var(--font-lobster)]")}>
              Keep Swimmin&apos;
            </h1>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-700 md:text-3xl">
              Build your own theme with AI—then get quotes that match it
            </p>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              Describe the vibe you want—calm mornings, grind mode, gentle recovery—and we shape a theme around you. Your daily
              quotes arrive tuned to that world, so motivation never feels generic.
            </p>
            <div className="mt-8">
              <p className="text-sm font-medium text-slate-700">Get the app</p>
              <a
                href="https://apps.apple.com/app/your-app-id"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block transition-opacity hover:opacity-90"
              >
                <Image
                  src={publicAsset("/images/app-store-badge.svg")}
                  alt="Download on the App Store"
                  width={150}
                  height={50}
                  className="h-[50px] w-[150px]"
                  style={{ width: "auto", height: "auto" }}
                />
              </a>
              <p className="mt-3 text-sm text-slate-500">Available on iOS. Links to the App Store.</p>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <IPhoneMockup />
          </div>
        </section>

        <HowItWorksVisualSection />

        <QuoteNotificationShowcaseSection />

        {/* Features */}
        <section className="border-t border-slate-200/60 bg-white/30 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">What you get</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-slate-600">
              AI-crafted themes and quotes that sound like they were written for you—not a random feed.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <FeatureCard
                icon={<Wand2 className="h-6 w-6 text-sky-500" />}
                title="Your theme, your AI"
                description="Create a custom theme in your own words. We translate that into a steady stream of quotes that fit your headspace."
              />
              <FeatureCard
                icon={<Quote className="h-6 w-6 text-sky-500" />}
                title="Quotes that match"
                description="No one-size-fits-all platitudes—notifications and daily lines aligned to the theme you defined."
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6 text-sky-500" />}
                title="Progress & growth"
                description="Grow your whale as you stay consistent—small wins stack into a story you can see."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6 text-sky-500" />}
                title="Community"
                description="Share the journey with others who are keeping swimmin’ too."
              />
              <div
                className="rounded-2xl border border-slate-200 bg-cover bg-center p-8 shadow-lg transition-shadow hover:shadow-xl md:col-span-2"
                style={{ backgroundImage: `url(${publicAsset("/images/hero-bg.png")})` }}
              >
                <div className="rounded-xl bg-white/90 p-6 backdrop-blur-sm md:inline-block md:max-w-md">
                  <h3 className="text-xl font-semibold text-slate-800">Ocean-themed calm</h3>
                  <p className="mt-2 text-slate-600">
                    Soft blues, friendly characters, and a pace that feels supportive—not pushy.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-10 text-center text-xs text-slate-500">
              Features may vary by version. See the App Store listing for the latest.
            </p>
          </div>
        </section>

        {/* CTA band */}
        <section className="px-6 py-16 md:py-20">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-sky-50 px-8 py-12 md:px-12 md:py-14">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200/80">
                <Sparkles className="h-3.5 w-3.5" />
                Start your streak
              </div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
                Ready to dive in?
              </h2>
              <p className="mt-3 max-w-xl text-lg text-slate-600">
                Download Keep Swimmin&apos; and take the first step toward a steadier, kinder motivation habit.
              </p>
              <Link
                href="https://apps.apple.com/app/your-app-id"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-slate-700"
              >
                Get the app
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 border-t border-slate-100 px-8 py-8 md:grid-cols-3 md:px-12">
              {[
                { t: "Quick sessions", d: "Built for busy days." },
                { t: "Positive framing", d: "Encouragement-first copy." },
                { t: "Your pace", d: "No guilt—just progress." },
              ].map((x) => (
                <div key={x.t}>
                  <p className="font-semibold text-slate-800">{x.t}</p>
                  <p className="mt-1 text-sm text-slate-600">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story / journey */}
        <section className="border-t border-slate-200/60 bg-white/20 px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-sky-500/20">
              <span aria-hidden>🐋</span>
              Your journey
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 md:text-5xl">Grow one quote at a time</h2>
            <p className="mx-auto mt-4 max-w-3xl text-xl leading-relaxed text-slate-600">
              Start small. Show up daily. Let the story unfold as your habits compound—just like the ocean builds wave after
              wave.
            </p>
            <div className="relative mx-auto mt-16 max-w-4xl">
              <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gradient-to-r from-transparent via-sky-200 to-transparent md:block" aria-hidden />
              <div className="grid gap-12 md:grid-cols-3 md:gap-8">
                <Step n={1} emoji="🌊" title="Dive in" text="Open the app and meet your whale." />
                <Step n={2} emoji="✨" title="Collect krills" text="Save quotes that resonate with you." />
                <Step n={3} emoji="🚀" title="Level up" text="Stay consistent and watch growth stack." />
              </div>
            </div>
            <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 text-left text-slate-700 shadow-sm md:p-8">
              <p className="font-semibold text-emerald-900">Built for momentum</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Tiny actions beat perfect plans. Keep Swimmin&apos; is designed around that truth—gentle nudges, not pressure.
              </p>
            </div>
          </div>
        </section>

        {/* Visual strip */}
        <section className="px-6 py-12">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-12 md:gap-16">
            <Image
              src={publicAsset("/images/prawn.png")}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              src={publicAsset("/images/whale.png")}
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 object-contain"
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              src={publicAsset("/images/whales-group.png")}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        </section>

        <FaqSection />
      </main>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 shadow-md transition-shadow hover:shadow-lg md:p-8">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="mt-3 text-slate-600">{description}</p>
    </div>
  );
}

function Step({ n, emoji, title, text }: { n: number; emoji: string; title: string; text: string }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div
        className={cn(
          "relative z-[1] flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-3xl shadow-lg ring-4 ring-white",
        )}
        aria-hidden
      >
        {emoji}
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-sky-600">Step {n}</p>
      <p className="mt-2 text-lg font-bold text-slate-800">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}
