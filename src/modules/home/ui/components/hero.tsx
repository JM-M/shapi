/* eslint-disable @typescript-eslint/no-explicit-any */

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/contexts/dashboard";
import { importSwaggerFromUrl } from "@/lib/swagger-import-utils";
import * as yaml from "js-yaml";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const Hero = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSwaggerSpec, setError: setContextError } = useDashboard();
  const router = useRouter();

  const handleImport = useCallback(async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setContextError(null);

    try {
      const result = await importSwaggerFromUrl(url);

      if (result.success && result.data) {
        // Parse the spec to extract metadata
        let specData: any;
        try {
          specData =
            result.format === "yaml"
              ? yaml.load(result.data)
              : JSON.parse(result.data);
        } catch (parseError) {
          console.warn(
            "Could not parse spec for metadata extraction: ",
            parseError,
          );
          specData = {};
        }

        // Save to dashboard context
        setSwaggerSpec({
          data: result.data,
          format: result.format!,
          url: url,
          title: specData.info?.title || "Imported API",
          version: specData.info?.version || "1.0.0",
          description: specData.info?.description || "",
        });

        // Navigate to dashboard
        router.push("/dashboard");
      } else {
        const errorMessage =
          result.error || "Failed to import Swagger specification";
        setError(errorMessage);
        setContextError(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setContextError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [url, setSwaggerSpec, setContextError, router]);

  // Add keyboard shortcut for Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        handleImport();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleImport]); // Include handleImport in dependencies

  return (
    <header className="flex flex-col items-center justify-center space-y-10 py-36">
      <div className="border-bg-muted max-auto flex min-h-32 w-lg flex-col gap-2 rounded-xl border p-2">
        <Textarea
          placeholder="Link to OpenAPI/Swagger website or file"
          className="flex-1 p-2 text-sm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          disabled={isLoading}
        />
        {error && <div className="px-2 text-sm text-red-500">{error}</div>}
        <div className="mt-auto flex items-center justify-end">
          <Button onClick={handleImport} disabled={isLoading || !url.trim()}>
            {isLoading ? (
              <>
                <Spinner />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
