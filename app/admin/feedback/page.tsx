import type { Metadata } from "next";
import { FeedbackDashboardLoader } from "./feedback-dashboard-loader";

export const metadata: Metadata = {
  title: "Feedback Hub Admin",
  description: "Private Keep Swimmin' feedback management dashboard.",
};

export default function FeedbackAdminPage() {
  return <FeedbackDashboardLoader />;
}
