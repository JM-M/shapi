/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/contexts/dashboard";
import * as yaml from "js-yaml";
import { useMemo } from "react";
import { OperationOverview } from "./request-doc/operation-overview";
import { ParametersSection } from "./request-doc/parameters-section";
import { RequestBodySection } from "./request-doc/request-body-section";
import { ResponsesSection } from "./request-doc/responses-section";
import { SecuritySection } from "./request-doc/security-section";

interface Parameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: {
    type?: string;
    format?: string;
    enum?: string[];
    items?: any;
  };
}

interface Response {
  description: string;
  content?: {
    [mediaType: string]: {
      schema?: any;
    };
  };
}

interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: {
    description?: string;
    content?: {
      [mediaType: string]: {
        schema?: any;
      };
    };
    required?: boolean;
  };
  responses?: {
    [statusCode: string]: Response;
  };
  security?: any[];
  deprecated?: boolean;
}

export const RequestDoc = () => {
  const { state } = useDashboard();

  const currentOperation = useMemo(() => {
    if (!state.swaggerSpec || !state.requestUrl || !state.requestMethod) {
      return null;
    }

    try {
      const spec =
        state.swaggerSpec.format === "yaml"
          ? yaml.load(state.swaggerSpec.data)
          : JSON.parse(state.swaggerSpec.data);

      if (!spec.paths) return null;

      // Extract path from the current request URL
      const baseUrl = state.baseUrl || "";
      let path = state.requestUrl;

      if (baseUrl && state.requestUrl.startsWith(baseUrl)) {
        path = state.requestUrl.substring(baseUrl.length);
      }

      // Normalize path - ensure it starts with /
      if (!path.startsWith("/")) {
        path = "/" + path;
      }

      // Find the matching path in the OpenAPI spec
      // First try exact match
      let pathItem = spec.paths[path];

      // If no exact match, try to find a path with parameters
      if (!pathItem) {
        const pathSegments = path.split("/");

        for (const [specPath, specPathItem] of Object.entries(spec.paths)) {
          const specPathSegments = specPath.split("/");

          // Check if the number of segments match
          if (pathSegments.length === specPathSegments.length) {
            let matches = true;

            for (let i = 0; i < pathSegments.length; i++) {
              const pathSegment = pathSegments[i];
              const specSegment = specPathSegments[i];

              // If spec segment is a parameter (starts with { and ends with }), it matches any value
              if (specSegment.startsWith("{") && specSegment.endsWith("}")) {
                continue;
              }

              // Otherwise, segments must match exactly
              if (pathSegment !== specSegment) {
                matches = false;
                break;
              }
            }

            if (matches) {
              pathItem = specPathItem;
              break;
            }
          }
        }
      }

      if (!pathItem) return null;

      // Find the operation for the current method
      const method = state.requestMethod.toLowerCase();
      const operation = pathItem[method] as Operation;

      return operation || null;
    } catch (error) {
      console.error("Error parsing OpenAPI spec:", error);
      return null;
    }
  }, [state.swaggerSpec, state.requestUrl, state.requestMethod, state.baseUrl]);

  if (!currentOperation) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No documentation available for the current request. Please select
              an endpoint from the sidebar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="space-y-4 p-4">
        <OperationOverview
          operation={currentOperation}
          method={state.requestMethod}
        />
        <ParametersSection parameters={currentOperation.parameters || []} />
        <RequestBodySection requestBody={currentOperation.requestBody} />
        <ResponsesSection responses={currentOperation.responses || {}} />
        <SecuritySection security={currentOperation.security} />
      </div>
    </div>
  );
};
