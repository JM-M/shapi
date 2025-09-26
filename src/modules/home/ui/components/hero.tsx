/* eslint-disable @typescript-eslint/no-explicit-any */

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/contexts/dashboard";
import { importSwaggerFromUrl } from "@/lib/swagger-import-utils";
import * as yaml from "js-yaml";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const Hero = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { setSwaggerSpec, setError: setContextError } = useDashboard();
  const router = useRouter();
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Validate if file is a valid JSON/YAML file
  const isValidFileType = (file: File): boolean => {
    const validExtensions = [".json", ".yaml", ".yml"];
    const fileName = file.name.toLowerCase();
    return validExtensions.some((ext) => fileName.endsWith(ext));
  };

  // Validate if content is a valid OpenAPI/Swagger spec
  const validateOpenAPISpec = (
    content: string,
    format: "json" | "yaml",
  ): { success: boolean; data?: any; error?: string } => {
    try {
      let data: any;

      if (format === "yaml") {
        data = yaml.load(content);
      } else {
        data = JSON.parse(content);
      }

      // Basic OpenAPI spec validation
      if (typeof data === "object" && data !== null) {
        if (data.openapi || data.swagger) {
          return {
            success: true,
            data: data,
          };
        }
      }

      return {
        success: false,
        error:
          "Content does not appear to be a valid OpenAPI/Swagger specification",
      };
    } catch (error) {
      return {
        success: false,
        error: `Invalid ${format.toUpperCase()}: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  };

  // Process dropped file
  const processDroppedFile = useCallback(
    async (file: File) => {
      if (!isValidFileType(file)) {
        setError("Please drop a valid JSON or YAML file (.json, .yaml, .yml)");
        return;
      }

      setIsLoading(true);
      setError(null);
      setContextError(null);

      try {
        const content = await file.text();
        const fileName = file.name.toLowerCase();
        const format =
          fileName.endsWith(".yaml") || fileName.endsWith(".yml")
            ? "yaml"
            : "json";

        // Validate the content
        const validation = validateOpenAPISpec(content, format);
        if (!validation.success) {
          setError(validation.error || "Invalid file content");
          setContextError(validation.error || "Invalid file content");
          return;
        }

        // Extract metadata from the spec
        const specData = validation.data;

        // Save to dashboard context
        setSwaggerSpec({
          data: content,
          format: format,
          url: file.name, // Use filename as identifier
          title: specData.info?.title || "Imported API",
          version: specData.info?.version || "1.0.0",
          description: specData.info?.description || "",
        });

        // Navigate to dashboard
        router.push("/dashboard");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        setContextError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [setSwaggerSpec, setContextError, router],
  );

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

  // Drag and drop event handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the dropzone entirely
    if (!dropzoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        // Process the first file
        processDroppedFile(files[0]);
      }
    },
    [processDroppedFile],
  );

  return (
    <header className="flex flex-col items-center justify-center space-y-10 py-36">
      {/* Hero Title and Subtitle */}
      <div className="space-y-4 px-10 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-6xl">
          A Better Way to Test APIs
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl">
          Import your OpenAPI/Swagger specifications and test your APIs with
          ease. No more complex tools - just paste a URL or drop a JSON/YAML
          file and start testing.
        </p>
      </div>

      <div
        ref={dropzoneRef}
        className={`border-bg-muted max-auto border-primary/60 relative flex min-h-32 w-lg flex-col gap-2 rounded-xl border p-2 transition-colors duration-200 ${
          isDragOver ? "border-primary bg-primary/5 border-2 border-dashed" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          placeholder="Link to OpenAPI/Swagger website or file (or drop a JSON/YAML file here)"
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
        {isDragOver && (
          <div className="bg-primary/10 pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <div className="text-primary text-lg font-medium">
                Drop your JSON/YAML file here
              </div>
              <div className="text-muted-foreground text-sm">
                Supports .json, .yaml, .yml files
              </div>
            </div>
          </div>
        )}
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
