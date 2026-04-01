import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Settings,
  ListChecks,
  Server,
  MicOff,
} from 'lucide-react';
import LegalFooter from '../components/LegalFooter';
import WhaleMark from '../assets/Keep Swimmin Whale-01 2.png';

const pageBg = 'min-h-screen bg-[#F2F6FA]';

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-card md:p-10 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800 md:mb-8 md:text-2xl">
      <Icon className="h-6 w-6 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
      {children}
    </h2>
  );
}

function CollectItem({ title, description, dot = 'bg-sky-400' }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function UseLine({ text, dotClass }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
      <p className="font-semibold leading-relaxed text-slate-800">{text}</p>
    </div>
  );
}

const PrivacyPolicy = () => {
  return (
    <div className={`flex flex-col font-inter text-slate-800 antialiased ${pageBg}`}>
      <header className="border-b border-slate-200/90 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-sm text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <img
              src={WhaleMark}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-lg object-contain shadow-sm ring-1 ring-slate-200/80"
            />
            <span className="font-semibold text-slate-700">Back to Keep Swimmin&apos;</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:py-16">
        <div className="mb-14 text-center md:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-sky-500/20">
            <Shield className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span>Privacy &amp; Security</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-800 md:text-5xl">Privacy Policy</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            Keep Swimmin&apos; (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to
            protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your
            information when you use our mobile application.
          </p>
          <p className="mt-5 text-sm text-slate-500">Last updated: April 1, 2026</p>
        </div>

        <div className="space-y-8">
          <Card>
            <SectionTitle icon={Eye}>Information we collect</SectionTitle>
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="space-y-5">
                <CollectItem
                  title="Account information"
                  description="Such as email (if applicable)."
                  dot="bg-sky-400"
                />
                <CollectItem
                  title="Usage data"
                  description="Interactions within the app, session activity, and feature usage."
                  dot="bg-sky-400"
                />
              </div>
              <div className="space-y-5">
                <CollectItem
                  title="Text input data"
                  description="Messages or text you provide during sessions (used to generate responses and summaries)."
                  dot="bg-sky-400"
                />
                <CollectItem
                  title="Device information"
                  description="Basic device data (e.g., device type, operating system)."
                  dot="bg-sky-400"
                />
              </div>
            </div>
          </Card>

          <Card className="border-sky-100 bg-gradient-to-br from-sky-50/90 to-white">
            <SectionTitle icon={MicOff}>Important clarification</SectionTitle>
            <p className="text-[15px] leading-relaxed text-slate-600 md:text-base">
              We do not record or store audio. Voice input, if used, is processed in real-time and converted to text on-device
              or through secure services, and only the resulting text may be used within the app.
            </p>
          </Card>

          <Card>
            <SectionTitle icon={Settings}>How we use your information</SectionTitle>
            <div className="space-y-4">
              <UseLine text="To provide and improve the app experience" dotClass="bg-emerald-500" />
              <UseLine text="To generate personalized responses and summaries" dotClass="bg-emerald-500" />
              <UseLine text="To analyze usage patterns and improve features" dotClass="bg-emerald-500" />
              <UseLine text="To manage subscriptions and payments" dotClass="bg-sky-400" />
              <UseLine text="To ensure app security and prevent abuse" dotClass="bg-blue-600" />
            </div>
          </Card>

          <Card>
            <SectionTitle icon={Lock}>{'Data storage & security'}</SectionTitle>
            <p className="mb-8 text-[15px] leading-relaxed text-slate-600 md:text-base">
              We use secure third-party services (such as Firebase and trusted cloud providers) to store and process data. We
              take reasonable measures to protect your information.
            </p>
            <div className="border-t border-slate-100 pt-8">
              <h3 className="mb-4 flex items-center gap-3 text-lg font-bold text-slate-800">
                <Server className="h-5 w-5 text-sky-500" strokeWidth={2} aria-hidden />
                Third-party services
              </h3>
              <p className="mb-4 text-slate-600">We may use services such as:</p>
              <ul className="space-y-3 text-slate-600">
                {[
                  'Firebase (authentication, database)',
                  'Analytics tools (e.g., Mixpanel)',
                  'Payment processors (e.g., Apple In-App Purchases)',
                  'AI services to generate responses based on user-provided text',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-slate-500">
                These services may process data according to their own privacy policies.
              </p>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={ListChecks}>Your rights</SectionTitle>
            <p className="mb-4 font-semibold text-slate-800">You can:</p>
            <div className="space-y-4">
              <UseLine text="Request deletion of your data" dotClass="bg-sky-400" />
              <UseLine text="Stop using the app at any time" dotClass="bg-sky-400" />
              <UseLine text="Manage subscriptions through your Apple account" dotClass="bg-sky-400" />
            </div>
          </Card>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-8 md:p-9">
              <h3 className="mb-3 text-lg font-bold text-slate-800">Children&apos;s privacy</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Keep Swimmin&apos; is not intended for children under 13, and we do not knowingly collect data from children.
              </p>
            </Card>
            <Card className="p-8 md:p-9">
              <h3 className="mb-3 text-lg font-bold text-slate-800">Changes to this policy</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                We may update this Privacy Policy from time to time. Updates will be reflected with a new &quot;Last
                updated&quot; date.
              </p>
            </Card>
          </div>

          <section className="rounded-[1.75rem] border border-sky-200/90 bg-gradient-to-br from-sky-50 via-blue-50/80 to-sky-50/50 p-8 shadow-card md:p-10">
            <h2 className="mb-3 text-2xl font-bold text-slate-800">Contact us</h2>
            <p className="mb-5 text-slate-600">If you have any questions, contact us at:</p>
            <p className="text-lg">
              <span className="font-semibold text-slate-800">Email: </span>
              <a
                href="mailto:support@keepswimmin.com"
                className="font-semibold text-sky-600 underline decoration-sky-300/60 underline-offset-2 transition hover:text-sky-700"
              >
                support@keepswimmin.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default PrivacyPolicy;
