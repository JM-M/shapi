import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { Fragment } from "react";
import { CommandPalette } from "./command-palette";

const endpoints = Array.from({ length: 3 }).map((_, i, a) => ({
  name: `Model ${i + 1}`,
  endpoints: Array.from({ length: 5 }).map(
    (_, j, a) => `/v1/users/{id}/something/{somethingId}`,
  ),
}));

export const Endpoints = () => {
  return (
    <div className="h-full space-y-4 p-2">
      <CommandPalette />
      <ScrollArea className="h-full [&>div>div]:!block">
        <div className="text-sm">
          {endpoints.map(({ name, endpoints: modelEndpoints }, i) => (
            <div key={i}>
              <div className="flex items-center gap-1 p-2 text-wrap">
                <ChevronRightIcon className="size-4 rotate-90" />
                <span>{name}</span>
              </div>
              <ul className="border-accent/50 ml-4 border-l text-[13px]">
                {modelEndpoints.map((endpoint, j) => (
                  <li
                    key={j}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "flex h-[unset] items-start gap-2 rounded-l-none p-2",
                    )}
                  >
                    <div className="flex flex-wrap items-center text-wrap">
                      {endpoint.split("/").map((part, k) => (
                        <Fragment key={k}>
                          <span>
                            {part}
                            {k < endpoint.split("/").length - 1 && "/"}
                          </span>
                        </Fragment>
                      ))}
                    </div>
                    <span className="text-xs font-medium">POST</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
