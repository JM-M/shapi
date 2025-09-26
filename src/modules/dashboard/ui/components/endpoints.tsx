"use client";

import { buttonVariants } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard";
import { cn } from "@/lib/utils";
import * as yaml from "js-yaml";
import { ChevronRightIcon } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { CommandPalette } from "./command-palette";

export const Endpoints = () => {
  const { state, setRequestUrl, setRequestMethod, syncPathParamsWithUrl } =
    useDashboard();

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

  return (
    <div className="h-full space-y-4 p-2">
      <div className="sticky top-0">
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
                    {groupEndpoints.map((endpoint, j) => (
                      <li
                        key={j}
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "hover:bg-accent/50 flex h-[unset] cursor-pointer items-center justify-between gap-2 rounded-l-none p-2",
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
                        <span className="text-xs font-medium">
                          {endpoint.method}
                        </span>
                      </li>
                    ))}
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
