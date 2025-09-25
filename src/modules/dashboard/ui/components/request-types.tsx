"use client";

import { CodeEditor } from "@/components/code-editor";
import { useDashboard } from "@/contexts/dashboard";
import {
  generateEndpointTypes,
  parseOpenAPISpec,
} from "@/lib/openapi-to-typescript";
import { useMemo } from "react";

// TODO: Make type references clickable to show full type definitions
// - Parse TypeScript output to identify reference types (e.g., User in "User[]")
// - Make referenced type names clickable with hover effects
// - Open modal/sidebar with full type definition when clicked
// - Use getSchemaDefinitions() to get complete schema definitions
// - Similar to VS Code/IDE type exploration experience

export const RequestTypes = () => {
  const { state } = useDashboard();

  const types = useMemo(() => {
    if (!state.swaggerSpec) return null;

    const spec = parseOpenAPISpec(
      state.swaggerSpec.data,
      state.swaggerSpec.format,
    );
    if (!spec) return null;

    // Extract path and method from the current request URL
    const baseUrl = state.baseUrl;
    const requestUrl = state.requestUrl;
    const method = state.requestMethod;

    if (!baseUrl || !requestUrl.startsWith(baseUrl)) {
      return null;
    }

    const path = requestUrl.substring(baseUrl.length);
    if (!path) return null;

    // Find the matching path in the spec
    const matchingPath = Object.keys(spec.paths).find((specPath) => {
      // Simple path matching - could be enhanced with parameter matching
      const specPathPattern = specPath.replace(/\{[^}]+\}/g, "[^/]+");
      const regex = new RegExp(`^${specPathPattern}$`);
      return regex.test(path);
    });

    if (!matchingPath) return null;

    return generateEndpointTypes(spec, matchingPath, method);
  }, [state.swaggerSpec, state.baseUrl, state.requestUrl, state.requestMethod]);

  if (!types) {
    return (
      <div className="space-y-4">
        <div className="text-muted-foreground text-sm">
          No type information available. Make sure you have a valid OpenAPI spec
          loaded and a matching endpoint selected.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {types.requestType && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Request Type</h3>
            <span className="text-muted-foreground text-xs">
              {types.requestType.name}
            </span>
          </div>
          <div className="bg-muted/50 rounded-md border">
            <CodeEditor
              value={types.requestType.definition}
              onChange={() => {}}
              language="typescript"
              minHeight="100px"
              className="h-fit"
              readOnly
              showCopyButton
            />
          </div>
        </div>
      )}

      {types.responseType && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Response Type</h3>
            <span className="text-muted-foreground text-xs">
              {types.responseType.name}
            </span>
          </div>
          <div className="bg-muted/50 rounded-md border">
            <CodeEditor
              value={types.responseType.definition}
              onChange={() => {}}
              language="typescript"
              readOnly
              height="200px"
              minHeight="100px"
            />
          </div>
        </div>
      )}

      {!types.requestType && !types.responseType && (
        <div className="text-muted-foreground text-sm">
          No type definitions found for this endpoint.
        </div>
      )}
    </div>
  );
};
