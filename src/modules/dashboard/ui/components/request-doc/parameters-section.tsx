"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Parameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: {
    type?: string;
    format?: string;
    enum?: string[];
    items?: any;
  };
}

interface ParametersSectionProps {
  parameters: Parameter[];
}

export const ParametersSection = ({ parameters }: ParametersSectionProps) => {
  if (parameters.length === 0) return null;

  const queryParams = parameters.filter((p) => p.in === "query");
  const pathParams = parameters.filter((p) => p.in === "path");
  const headerParams = parameters.filter((p) => p.in === "header");

  return (
    <Card className="py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-base">Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-3">
        {pathParams.length > 0 && (
          <div>
            <h4 className="text-foreground mb-2 text-sm font-medium">
              Path Parameters
            </h4>
            <div className="space-y-2">
              {pathParams.map((param, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                      {param.name}
                    </code>
                    {param.required && (
                      <span className="text-xs font-medium text-red-600">
                        Required
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {param.schema?.type || "string"}
                    </span>
                  </div>
                  {param.description && (
                    <p className="text-muted-foreground text-sm">
                      {param.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {queryParams.length > 0 && (
          <div>
            <h4 className="text-foreground mb-2 text-sm font-medium">
              Query Parameters
            </h4>
            <div className="space-y-2">
              {queryParams.map((param, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                      {param.name}
                    </code>
                    {param.required && (
                      <span className="text-xs font-medium text-red-600">
                        Required
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {param.schema?.type || "string"}
                    </span>
                  </div>
                  {param.description && (
                    <p className="text-muted-foreground text-sm">
                      {param.description}
                    </p>
                  )}
                  {param.schema?.enum && (
                    <div className="mt-2">
                      <p className="text-muted-foreground mb-1 text-xs">
                        Possible values:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {param.schema.enum.map((value, i) => (
                          <code
                            key={i}
                            className="bg-muted rounded px-1 py-0.5 text-xs"
                          >
                            {value}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {headerParams.length > 0 && (
          <div>
            <h4 className="text-foreground mb-2 text-sm font-medium">
              Header Parameters
            </h4>
            <div className="space-y-2">
              {headerParams.map((param, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                      {param.name}
                    </code>
                    {param.required && (
                      <span className="text-xs font-medium text-red-600">
                        Required
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {param.schema?.type || "string"}
                    </span>
                  </div>
                  {param.description && (
                    <p className="text-muted-foreground text-sm">
                      {param.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
