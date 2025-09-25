"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  deprecated?: boolean;
}

interface OperationOverviewProps {
  operation: Operation;
  method: string;
}

export const OperationOverview = ({
  operation,
  method,
}: OperationOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">
            {operation.summary || "API Endpoint"}
          </CardTitle>
          {operation.deprecated && (
            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-700/10 ring-inset">
              Deprecated
            </span>
          )}
        </div>
        <div>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
            {method}
          </span>
        </div>
        {operation.operationId && (
          <p className="text-muted-foreground text-sm">
            Operation ID: {operation.operationId}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {operation.description && (
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed">{operation.description}</p>
          </div>
        )}
        {operation.tags && operation.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {operation.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
