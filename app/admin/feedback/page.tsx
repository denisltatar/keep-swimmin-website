import type { Metadata } from "next";
import { FeedbackDashboard } from "./feedback-dashboard";

export const metadata: Metadata = {
  title: "Feedback Hub Admin",
  description: "Private Keep Swimmin' feedback management dashboard.",
};

export default function FeedbackAdminPage() {
  return <FeedbackDashboard />;
}
