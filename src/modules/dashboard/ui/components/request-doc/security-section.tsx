"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SecuritySectionProps {
  security?: any[];
}

export const SecuritySection = ({ security }: SecuritySectionProps) => {
  if (!security || security.length === 0) return null;

  return (
    <Card className="py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-base">Security</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <p className="text-muted-foreground text-sm">
          This endpoint requires authentication. Please configure authentication
          in the Auth tab.
        </p>
      </CardContent>
    </Card>
  );
};
