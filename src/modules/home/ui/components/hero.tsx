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

  const handleImport = useCallback(
    async (importUrl?: string) => {
      const urlToUse = importUrl || url;

      if (!urlToUse.trim()) {
        setError("Please enter a URL");
        return;
      }

      setIsLoading(true);
      setError(null);
      setContextError(null);

      try {
        const result = await importSwaggerFromUrl(urlToUse);

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
            url: urlToUse,
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
    },
    [url, setSwaggerSpec, setContextError, router],
  );

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
      {/* Hero Title and Subtitle */}
      <div className="space-y-4 px-10 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-6xl">
          A Better Way to Test APIs
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl">
          Import your OpenAPI/Swagger specifications and test your APIs with
          ease. No more complex tools - just paste a URL and start testing.
        </p>
      </div>

      <div className="border-bg-muted max-auto border-primary/60 flex min-h-32 w-lg flex-col gap-2 rounded-xl border p-2">
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
          <Button
            onClick={() => handleImport()}
            disabled={isLoading || !url.trim()}
          >
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

      {/* Examples Section */}
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground text-sm">
          Try these examples to get started:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setUrl("https://petstore.swagger.io/");
              // Trigger import with the URL directly
              await handleImport("https://petstore.swagger.io/");
            }}
            className="!border-primary/30 text-xs"
          >
            🐾 Petstore API
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setUrl("https://fakerestapi.azurewebsites.net/index.html");
              // Trigger import with the URL directly
              await handleImport(
                "https://fakerestapi.azurewebsites.net/index.html",
              );
            }}
            className="!border-primary/30 text-xs"
          >
            🧪 Fake REST API
          </Button>
        </div>
      </div>
    </header>
  );
};
