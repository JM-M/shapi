import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard";
import { generateEndpointMockData } from "@/lib/mock-data-generator";
import { parseOpenAPISpec } from "@/lib/openapi-to-typescript";
import { useMemo, useState } from "react";

export const RequestBody = () => {
  const { state, setRequestBody } = useDashboard();
  const [isValidJson, setIsValidJson] = useState(true);

  // Check if we can generate mock data for the current endpoint
  const canGenerateMockData = useMemo(() => {
    if (!state.swaggerSpec) return false;

    const spec = parseOpenAPISpec(
      state.swaggerSpec.data,
      state.swaggerSpec.format,
    );
    if (!spec) return false;

    const baseUrl = state.baseUrl;
    const requestUrl = state.requestUrl;
    const method = state.requestMethod;

    if (!baseUrl || !requestUrl.startsWith(baseUrl)) {
      return false;
    }

    const path = requestUrl.substring(baseUrl.length);
    if (!path) return false;

    // Find the matching path in the spec
    const matchingPath = Object.keys(spec.paths).find((specPath) => {
      const specPathPattern = specPath.replace(/\{[^}]+\}/g, "[^/]+");
      const regex = new RegExp(`^${specPathPattern}$`);
      return regex.test(path);
    });

    if (!matchingPath) return false;

    // Check if this endpoint has a request body schema
    const pathItem = spec.paths[matchingPath];
    const operation = pathItem[method.toLowerCase()];
    if (!operation) return false;

    const requestSchema =
      operation.requestBody?.content?.["application/json"]?.schema ||
      operation.requestBody?.content?.["application/x-www-form-urlencoded"]
        ?.schema ||
      operation.parameters?.find((p: any) => p.in === "body")?.schema;

    return !!requestSchema;
  }, [state.swaggerSpec, state.baseUrl, state.requestUrl, state.requestMethod]);

  const handleBodyChange = (value: string) => {
    setRequestBody(value);

    // Validate JSON if not empty
    if (value.trim()) {
      try {
        JSON.parse(value);
        setIsValidJson(true);
      } catch {
        setIsValidJson(false);
      }
    } else {
      setIsValidJson(true);
    }
  };

  const formatJson = () => {
    if (state.requestBody.trim()) {
      try {
        const parsed = JSON.parse(state.requestBody);
        const formatted = JSON.stringify(parsed, null, 2);
        setRequestBody(formatted);
        setIsValidJson(true);
      } catch {
        // If JSON is invalid, don't format
      }
    }
  };

  const generateMockData = () => {
    if (!state.swaggerSpec) return;

    const spec = parseOpenAPISpec(
      state.swaggerSpec.data,
      state.swaggerSpec.format,
    );
    if (!spec) return;

    const baseUrl = state.baseUrl;
    const requestUrl = state.requestUrl;
    const method = state.requestMethod;

    if (!baseUrl || !requestUrl.startsWith(baseUrl)) {
      return;
    }

    const path = requestUrl.substring(baseUrl.length);
    if (!path) return;

    // Find the matching path in the spec
    const matchingPath = Object.keys(spec.paths).find((specPath) => {
      const specPathPattern = specPath.replace(/\{[^}]+\}/g, "[^/]+");
      const regex = new RegExp(`^${specPathPattern}$`);
      return regex.test(path);
    });

    if (!matchingPath) return;

    const mockData = generateEndpointMockData(spec, matchingPath, method);
    if (mockData) {
      const formattedMockData = JSON.stringify(mockData, null, 2);
      setRequestBody(formattedMockData);
      setIsValidJson(true);
    }
  };

  console.log(canGenerateMockData);

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Request Body</span>
          <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
            {state.requestBodyType.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={formatJson}
            disabled={!state.requestBody.trim() || !isValidJson}
          >
            Format JSON
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <CodeEditor
          value={state.requestBody}
          onChange={handleBodyChange}
          language="json"
          placeholder="Enter JSON request body..."
        />
        {true && (
          <div className="mt-2 flex items-center justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={generateMockData}>
              Generate Mock Data
            </Button>
          </div>
        )}
      </div>

      {!isValidJson && state.requestBody.trim() && (
        <div className="rounded border bg-red-50 p-2 text-sm text-red-500 dark:bg-red-950/20">
          Invalid JSON format. Please check your syntax.
        </div>
      )}
    </div>
  );
};
