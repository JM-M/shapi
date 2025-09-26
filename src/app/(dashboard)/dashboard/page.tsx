import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your OpenAPI/Swagger APIs with Shapi's powerful dashboard. Test endpoints, view documentation, and streamline your API development workflow.",
};

const DashboardPage = () => {
  return <DashboardView />;
};
export default DashboardPage;
