"use client";

import dynamic from "next/dynamic";

const FeedbackDashboard = dynamic(
  () => import("./feedback-dashboard").then((module) => module.FeedbackDashboard),
  {
    ssr: false,
    loading: () => (
      <main className="fixed inset-0 z-50 grid place-items-center bg-[#f7f9fc] p-6 text-slate-900">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5285f7] text-lg font-black text-white">K</div>
          <h1 className="mt-5 text-2xl font-bold">Opening Feedback Hub…</h1>
          <p className="mt-2 text-sm text-slate-500">Starting the secure admin session.</p>
        </div>
      </main>
    ),
  },
);

export function FeedbackDashboardLoader() {
  return <FeedbackDashboard />;
}
