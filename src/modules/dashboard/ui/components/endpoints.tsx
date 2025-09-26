"use client";

import { buttonVariants } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard";
import { cn } from "@/lib/utils";
import * as yaml from "js-yaml";
import { ChevronRightIcon } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { CommandPalette } from "./command-palette";

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

export const Endpoints = () => {
  const { state, setRequestUrl, setRequestMethod, syncPathParamsWithUrl } =
    useDashboard();

  // Function to check if an endpoint is currently active
  const isEndpointActive = (endpoint: { path: string; method: string }) => {
    if (!state.requestUrl || !state.requestMethod) return false;
    
    const fullUrl = state.baseUrl
      ? `${state.baseUrl}${endpoint.path.startsWith("/") ? "" : "/"}${endpoint.path}`
      : endpoint.path;
    
    return fullUrl === state.requestUrl && endpoint.method === state.requestMethod;
  };

  // State to track which groups are open (default: all open)
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Function to toggle group visibility
  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const endpoints = useMemo(() => {
    if (!state.swaggerSpec) return [];

    try {
      const spec =
        state.swaggerSpec.format === "yaml"
          ? yaml.load(state.swaggerSpec.data)
          : JSON.parse(state.swaggerSpec.data);

      if (!spec.paths) return [];

      const endpointGroups: {
        [key: string]: Array<{ path: string; method: string; operation: any }>;
      } = {};

      Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
        // Extract first path segment for grouping
        const pathSegments = path
          .split("/")
          .filter((segment) => segment !== "");
        const groupName =
          pathSegments.length > 0
            ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1) // Capitalize first letter
            : "Root";

        if (!endpointGroups[groupName]) {
          endpointGroups[groupName] = [];
        }

        Object.entries(pathItem).forEach(
          ([method, operation]: [string, any]) => {
            if (
              [
                "get",
                "post",
                "put",
                "delete",
                "patch",
                "head",
                "options",
              ].includes(method)
            ) {
              endpointGroups[groupName].push({
                path,
                method: method.toUpperCase(),
                operation: operation as any,
              });
            }
          },
        );
      });

      const groups = Object.entries(endpointGroups).map(
        ([groupName, endpoints]) => ({
          name: groupName,
          endpoints,
        }),
      );

      // Initialize all groups as open on first load
      if (openGroups.size === 0) {
        setOpenGroups(new Set(groups.map((group) => group.name)));
      }

      return groups;
    } catch (error) {
      console.error("Error parsing Swagger spec:", error);
      return [];
    }
  }, [state.swaggerSpec]);

  // Auto-select the first endpoint when endpoints are loaded
  useEffect(() => {
    if (endpoints.length > 0 && !state.requestUrl) {
      const firstGroup = endpoints[0];
      if (firstGroup.endpoints.length > 0) {
        const firstEndpoint = firstGroup.endpoints[0];
        const fullUrl = state.baseUrl
          ? `${state.baseUrl}${firstEndpoint.path.startsWith("/") ? "" : "/"}${firstEndpoint.path}`
          : firstEndpoint.path;
        setRequestUrl(fullUrl);
        setRequestMethod(firstEndpoint.method);
        syncPathParamsWithUrl(fullUrl);
      }
    }
  }, [
    endpoints,
    state.baseUrl,
    state.requestUrl,
    setRequestUrl,
    setRequestMethod,
    syncPathParamsWithUrl,
  ]);

  return (
    <div className="h-full space-y-4 p-2">
      <div className="sticky top-2 z-10">
        <CommandPalette />
      </div>
      {/* <ScrollArea className="h-full [&>div>div]:!block"> */}
      <div className="text-sm">
        {endpoints.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center">
            No endpoints found
          </div>
        ) : (
          endpoints.map(({ name, endpoints: groupEndpoints }, i) => {
            const isOpen = openGroups.has(name);

            return (
              <div key={i}>
                <div
                  className="hover:bg-accent/50 flex cursor-pointer items-center gap-1 rounded p-2 text-wrap"
                  onClick={() => toggleGroup(name)}
                >
                  <ChevronRightIcon
                    className={cn(
                      "size-4 transition-transform",
                      isOpen ? "rotate-90" : "rotate-0",
                    )}
                  />
                  <span>{name}</span>
                </div>
                {isOpen && (
                  <ul className="border-accent/50 ml-4 border-l text-[13px]">
                    {groupEndpoints.map((endpoint, j) => {
                      const isActive = isEndpointActive(endpoint);
                      
                      return (
                        <li
                          key={j}
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "flex h-[unset] cursor-pointer items-center justify-between gap-2 rounded-l-none p-2",
                            isActive 
                              ? "bg-accent/50" 
                              : "hover:bg-accent/50"
                          )}
                          onClick={() => {
                            const fullUrl = state.baseUrl
                              ? `${state.baseUrl}${endpoint.path.startsWith("/") ? "" : "/"}${endpoint.path}`
                              : endpoint.path;
                            setRequestUrl(fullUrl);
                            setRequestMethod(endpoint.method);
                            syncPathParamsWithUrl(fullUrl);
                          }}
                        >
                        <div className="flex flex-wrap items-center text-wrap">
                          {endpoint.path.split("/").map((part, k) => (
                            <Fragment key={k}>
                              <span>
                                {part}
                                {k < endpoint.path.split("/").length - 1 && "/"}
                              </span>
                            </Fragment>
                          ))}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            getMethodStyle(endpoint.method),
                          )}
                        >
                          {endpoint.method}
                        </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* </ScrollArea> */}
    </div>
  );
};
