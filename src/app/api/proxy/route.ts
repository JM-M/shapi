import * as yaml from "js-yaml";
import { NextRequest, NextResponse } from "next/server";

/**
 * Validate if the content is a valid OpenAPI/Swagger spec
 */
function validateOpenAPISpec(
  content: string,
  contentType: string,
): { isValid: boolean; error?: string } {
  try {
    // Check if it's HTML content (Swagger UI pages are allowed)
    if (contentType.includes("text/html")) {
      // For HTML content, check if it contains Swagger UI indicators
      const htmlLower = content.toLowerCase();
      const hasSwaggerUI =
        htmlLower.includes("swagger") ||
        htmlLower.includes("openapi") ||
        htmlLower.includes("swagger-ui") ||
        htmlLower.includes("swaggeruibundle");

      if (hasSwaggerUI) {
        return { isValid: true };
      } else {
        return {
          isValid: false,
          error: "HTML content does not appear to be a Swagger UI page",
        };
      }
    }

    // For JSON/YAML content, validate it's a proper OpenAPI spec
    let data: any;
    const isYaml = contentType.includes("yaml") || contentType.includes("yml");

    if (isYaml) {
      data = yaml.load(content);
    } else {
      data = JSON.parse(content);
    }

    // Basic OpenAPI spec validation
    if (typeof data === "object" && data !== null) {
      if (data.openapi || data.swagger) {
        return { isValid: true };
      }
    }

    return {
      isValid: false,
      error:
        "Content does not appear to be a valid OpenAPI/Swagger specification",
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid content format: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const skipValidation = searchParams.get("skipValidation") === "true";

  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  try {
    // Validate that the URL is safe to proxy
    const url = new URL(targetUrl);

    // Allow all domains for development/testing
    // Note: In production, consider adding domain restrictions for security

    // Fetch the target URL
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json, application/yaml, text/yaml, text/html, */*",
        "User-Agent": "Mozilla/5.0 (compatible; NextJS-CORS-Proxy/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Target server returned ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.text();
    const contentType =
      response.headers.get("content-type") || "application/json";

    // Validate that the content is actually a Swagger/OpenAPI document
    if (!skipValidation) {
      const validation = validateOpenAPISpec(data, contentType);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: `Invalid content: ${validation.error}`,
            hint: "This proxy only serves Swagger/OpenAPI specifications and Swagger UI pages. Add ?skipValidation=true to bypass this check.",
          },
          { status: 400 },
        );
      }
    }

    // Return the response with CORS headers
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch target URL" },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
