import { DashboardLayout } from "../components/dashboard-layout";
import { Endpoints } from "../components/endpoints";
import { Request } from "../components/request";

export const DashboardView = () => {
  return (
    <DashboardLayout
      leftPanel={<Endpoints />}
      middlePanel={<Request />}
      rightPanel={<div>Right Panel</div>}
    />
  );
};
