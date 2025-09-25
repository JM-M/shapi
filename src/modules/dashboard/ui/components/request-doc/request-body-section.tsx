"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequestBody {
  description?: string;
  content?: {
    [mediaType: string]: {
      schema?: any;
    };
  };
  required?: boolean;
}

interface RequestBodySectionProps {
  requestBody: RequestBody | undefined;
}

export const RequestBodySection = ({
  requestBody,
}: RequestBodySectionProps) => {
  if (!requestBody) return null;

  return (
    <Card className="py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-base">Request Body</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        {requestBody.description && (
          <p className="text-muted-foreground mb-3 text-sm">
            {requestBody.description}
          </p>
        )}
        {requestBody.required && (
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-700/10 ring-inset">
            Required
          </span>
        )}
        {requestBody.content && (
          <div className="mt-3">
            <h5 className="mb-2 text-sm font-medium">Content Types:</h5>
            <div className="flex flex-wrap gap-2">
              {Object.keys(requestBody.content).map((contentType) => (
                <code
                  key={contentType}
                  className="bg-muted rounded px-2 py-1 text-xs"
                >
                  {contentType}
                </code>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
