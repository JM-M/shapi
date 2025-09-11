import { DashboardLayout } from "../components/dashboard-layout";

export const DashboardView = () => {
  return (
    <DashboardLayout
      leftPanel={<div>Left Panel</div>}
      middlePanel={<div>Middle Panel</div>}
      rightPanel={<div>Right Panel</div>}
    />
  );
};
