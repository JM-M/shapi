"use client";

import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboard } from "@/contexts/dashboard";
import { cn } from "@/lib/utils";
import * as yaml from "js-yaml";
import { ChevronRightIcon } from "lucide-react";
import { Fragment, useMemo } from "react";
import { CommandPalette } from "./command-palette";

export const Endpoints = () => {
  const { state } = useDashboard();

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
        const tags = pathItem.tags || ["Default"];
        const tag = tags[0]; // Use first tag as group

        if (!endpointGroups[tag]) {
          endpointGroups[tag] = [];
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
              endpointGroups[tag].push({
                path,
                method: method.toUpperCase(),
                operation: operation as any,
              });
            }
          },
        );
      });

      return Object.entries(endpointGroups).map(([tag, endpoints]) => ({
        name: tag,
        endpoints,
      }));
    } catch (error) {
      console.error("Error parsing Swagger spec:", error);
      return [];
    }
  }, [state.swaggerSpec]);

  return (
    <div className="h-full space-y-4 p-2">
      <CommandPalette />
      <ScrollArea className="h-full [&>div>div]:!block">
        <div className="text-sm">
          {endpoints.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center">
              No endpoints found
            </div>
          ) : (
            endpoints.map(({ name, endpoints: groupEndpoints }, i) => (
              <div key={i}>
                <div className="flex items-center gap-1 p-2 text-wrap">
                  <ChevronRightIcon className="size-4 rotate-90" />
                  <span>{name}</span>
                </div>
                <ul className="border-accent/50 ml-4 border-l text-[13px]">
                  {groupEndpoints.map((endpoint, j) => (
                    <li
                      key={j}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "flex h-[unset] items-start gap-2 rounded-l-none p-2",
                      )}
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
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
