"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Response {
  description: string;
  content?: {
    [mediaType: string]: {
      schema?: any;
    };
  };
}

interface ResponsesSectionProps {
  responses: {
    [statusCode: string]: Response;
  };
}

function getStatusText(statusCode: string): string {
  const status = parseInt(statusCode);
  if (status >= 200 && status < 300) return "Success";
  if (status >= 300 && status < 400) return "Redirection";
  if (status >= 400 && status < 500) return "Client Error";
  if (status >= 500 && status < 600) return "Server Error";
  return "Unknown";
}

export const ResponsesSection = ({ responses }: ResponsesSectionProps) => {
  if (Object.keys(responses).length === 0) return null;

  return (
    <Card className="py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-base">Responses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3">
        {Object.entries(responses).map(([statusCode, response]) => (
          <div key={statusCode} className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                {statusCode}
              </code>
              <span className="text-sm font-medium">
                {getStatusText(statusCode)}
              </span>
            </div>
            {response.description && (
              <p className="text-muted-foreground mb-2 text-sm">
                {response.description}
              </p>
            )}
            {response.content && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs">
                  Content Types:
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(response.content).map((contentType) => (
                    <code
                      key={contentType}
                      className="bg-muted rounded px-1 py-0.5 text-xs"
                    >
                      {contentType}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
