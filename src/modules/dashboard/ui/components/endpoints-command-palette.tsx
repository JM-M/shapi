"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useDashboard } from "@/contexts/dashboard";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Function to get styling for HTTP methods
const getMethodStyle = (method: string) => {
  const methodLower = method.toLowerCase();

  switch (methodLower) {
    case "get":
      return "text-green-800 dark:text-green-400";
    case "post":
      return "text-blue-800 dark:text-blue-400";
    case "put":
      return "text-orange-800 dark:text-orange-400";
    case "delete":
      return "text-red-800 dark:text-red-400";
    case "patch":
      return "text-purple-800 dark:text-purple-400";
    case "head":
      return "text-gray-800 dark:text-gray-400";
    case "options":
      return "text-yellow-800 dark:text-yellow-400";
    default:
      return "text-gray-800 dark:text-gray-400";
  }
};

export const EndpointsCommandPalette = () => {
  const [open, setOpen] = useState(false);
  const { state, setRequestUrl, setRequestMethod, syncPathParamsWithUrl } =
    useDashboard();

  const endpoints = state.parsedEndpoints || [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleEndpointSelect = (endpoint: { path: string; method: string }) => {
    const fullUrl = state.baseUrl
      ? `${state.baseUrl}${endpoint.path.startsWith("/") ? "" : "/"}${endpoint.path}`
      : endpoint.path;
    setRequestUrl(fullUrl);
    setRequestMethod(endpoint.method);
    syncPathParamsWithUrl(fullUrl);
    setOpen(false);
  };

  return (
    <>
      <div
        className="text-muted-foreground file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full min-w-0 cursor-text rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs backdrop-blur-lg transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center gap-2">
          <SearchIcon className="size-4" />
          <span>Search endpoints...</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </span>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search endpoints by path or method..." />
        <CommandList>
          <CommandEmpty>
            {endpoints.length === 0
              ? "No API endpoints found. Please load a Swagger/OpenAPI specification first."
              : "No endpoints found matching your search."}
          </CommandEmpty>
          {endpoints.map(({ name, endpoints: groupEndpoints }) => (
            <CommandGroup
              key={name}
              heading={
                <span className="text-foreground text-base font-semibold">
                  {name}
                </span>
              }
            >
              {groupEndpoints.map((endpoint, index) => (
                <CommandItem
                  key={`${endpoint.path}-${endpoint.method}-${index}`}
                  onSelect={() => handleEndpointSelect(endpoint)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{endpoint.path}</span>
                    {endpoint.operation?.summary && (
                      <span className="text-muted-foreground text-xs">
                        - {endpoint.operation.summary}
                      </span>
                    )}
                  </div>
                  <CommandShortcut
                    className={cn(
                      "text-xs font-medium",
                      getMethodStyle(endpoint.method),
                    )}
                  >
                    {endpoint.method}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
