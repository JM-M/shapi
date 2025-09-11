import { DashboardLayout } from "../components/dashboard-layout";
import { Endpoints } from "../components/endpoints";

export const DashboardView = () => {
  return (
    <DashboardLayout
      leftPanel={<Endpoints />}
      middlePanel={<div>Middle Panel</div>}
      rightPanel={<div>Right Panel</div>}
    />
  );
};
