"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/contexts/dashboard";
import { DashboardLayout } from "../components/dashboard-layout";
import { Endpoints } from "../components/endpoints";
import { Request } from "../components/request";
import { Response } from "../components/response";

export const DashboardView = () => {
  const { state, resetDashboard } = useDashboard();

  if (!state.swaggerSpec) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No API Specification Loaded</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Please import a Swagger/OpenAPI specification to get started.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full"
            >
              Go to Import
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      leftPanel={<Endpoints />}
      middlePanel={<Request />}
      rightPanel={<Response />}
    />
  );
};
