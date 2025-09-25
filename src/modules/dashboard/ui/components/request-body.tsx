import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard";
import { useState } from "react";

export const RequestBody = () => {
  const { state, setRequestBody } = useDashboard();
  const [isValidJson, setIsValidJson] = useState(true);

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

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Request Body</span>
          <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
            {state.requestBodyType.toUpperCase()}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={formatJson}
          disabled={!state.requestBody.trim() || !isValidJson}
        >
          Format JSON
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <CodeEditor
          value={state.requestBody}
          onChange={handleBodyChange}
          language="json"
          placeholder="Enter JSON request body..."
          className="h-full"
        />
      </div>

      {!isValidJson && state.requestBody.trim() && (
        <div className="rounded border bg-red-50 p-2 text-sm text-red-500 dark:bg-red-950/20">
          Invalid JSON format. Please check your syntax.
        </div>
      )}
    </div>
  );
};
