/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import * as yaml from "js-yaml";

export interface SwaggerImportResult {
  success: boolean;
  data?: string;
  format?: "json" | "yaml";
  error?: string;
}

/**
 * Common Swagger/OpenAPI spec endpoints to try
 */
const SWAGGER_ENDPOINTS = [
  "/swagger.json",
  "/swagger.yaml",
  "/openapi.json",
  "/openapi.yaml",
  "/v2/swagger.json",
  "/v2/swagger.yaml",
  "/v3/openapi.json",
  "/v3/openapi.yaml",
  "/api-docs",
  "/api-docs/swagger.json",
  "/api-docs/swagger.yaml",
  "/docs/swagger.json",
  "/docs/swagger.yaml",
];

/**
 * Extract base URL from a given URL
 */
function getBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return url;
  }
}

/**
 * Try to fetch Swagger spec from common endpoints
 */
async function tryCommonEndpoints(
  baseUrl: string,
): Promise<SwaggerImportResult> {
  for (const endpoint of SWAGGER_ENDPOINTS) {
    try {
      const fullUrl = `${baseUrl}${endpoint}`;
      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          Accept: "application/json, application/yaml, text/yaml, */*",
        },
      });

      if (response.status === 200 && response.data) {
        const contentType = response.headers["content-type"] || "";
        const isYaml =
          contentType.includes("yaml") ||
          contentType.includes("yml") ||
          endpoint.endsWith(".yaml") ||
          endpoint.endsWith(".yml");

        return {
          success: true,
          data:
            typeof response.data === "string"
              ? response.data
              : JSON.stringify(response.data, null, 2),
          format: isYaml ? "yaml" : "json",
        };
      }
    } catch (error) {
      // Continue to next endpoint
      continue;
    }
  }

  return {
    success: false,
    error: "No valid Swagger/OpenAPI spec found at common endpoints",
  };
}

/**
 * Try to extract spec URL from Swagger UI page
 */
async function extractSpecFromSwaggerUI(
  url: string,
): Promise<SwaggerImportResult> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (response.status === 200) {
      const html = response.data;

      // Look for common patterns in Swagger UI HTML
      const patterns = [
        /url:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /spec-url["']:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /swaggerUrl["']:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /openapiUrl["']:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /"url":\s*"([^"]*\.(?:json|yaml|yml))"/gi,
      ];

      for (const pattern of patterns) {
        const matches = html.match(pattern);
        if (matches) {
          for (const match of matches) {
            const urlMatch = match.match(/([^"']*\.(?:json|yaml|yml))/);
            if (urlMatch) {
              let specUrl = urlMatch[1];

              // Make URL absolute if it's relative
              if (specUrl.startsWith("/")) {
                const baseUrl = getBaseUrl(url);
                specUrl = `${baseUrl}${specUrl}`;
              } else if (!specUrl.startsWith("http")) {
                const baseUrl = getBaseUrl(url);
                specUrl = `${baseUrl}/${specUrl}`;
              }

              try {
                const specResponse = await axios.get(specUrl, {
                  timeout: 10000,
                  headers: {
                    Accept:
                      "application/json, application/yaml, text/yaml, */*",
                  },
                });

                if (specResponse.status === 200 && specResponse.data) {
                  const contentType =
                    specResponse.headers["content-type"] || "";
                  const isYaml =
                    contentType.includes("yaml") ||
                    contentType.includes("yml") ||
                    specUrl.endsWith(".yaml") ||
                    specUrl.endsWith(".yml");

                  return {
                    success: true,
                    data:
                      typeof specResponse.data === "string"
                        ? specResponse.data
                        : JSON.stringify(specResponse.data, null, 2),
                    format: isYaml ? "yaml" : "json",
                  };
                }
              } catch (error) {
                // Continue to next match
                continue;
              }
            }
          }
        }
      }
    }

    return {
      success: false,
      error: "Could not extract spec URL from Swagger UI page",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch Swagger UI page: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Validate if the content is a valid OpenAPI/Swagger spec
 */
function validateOpenAPISpec(
  content: string,
  format: "json" | "yaml",
): { success: boolean; data?: any; error?: string } {
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
}

/**
 * Main function to import Swagger spec from URL (Frontend-only)
 */
export async function importSwaggerFromUrl(
  url: string,
): Promise<SwaggerImportResult> {
  try {
    // Clean and validate URL
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // First, try to fetch the URL directly (in case it's already a spec file)
    try {
      const directResponse = await axios.get(cleanUrl, {
        timeout: 10000,
        headers: {
          Accept: "application/json, application/yaml, text/yaml, */*",
        },
      });

      if (directResponse.status === 200 && directResponse.data) {
        const contentType = directResponse.headers["content-type"] || "";
        const isYaml =
          contentType.includes("yaml") ||
          contentType.includes("yml") ||
          cleanUrl.endsWith(".yaml") ||
          cleanUrl.endsWith(".yml");

        const data =
          typeof directResponse.data === "string"
            ? directResponse.data
            : JSON.stringify(directResponse.data, null, 2);
        const format = isYaml ? "yaml" : "json";

        // Validate it's a valid OpenAPI spec
        const validation = validateOpenAPISpec(data, format);
        if (validation.success) {
          return {
            success: true,
            data: data,
            format: format,
          };
        }
      }
    } catch (error) {
      // Not a direct spec file, continue with other methods
    }

    // Try common endpoints
    const baseUrl = getBaseUrl(cleanUrl);
    const commonEndpointsResult = await tryCommonEndpoints(baseUrl);
    if (commonEndpointsResult.success) {
      return commonEndpointsResult;
    }

    // Try to extract from Swagger UI page
    const swaggerUIResult = await extractSpecFromSwaggerUI(cleanUrl);
    if (swaggerUIResult.success) {
      return swaggerUIResult;
    }

    return {
      success: false,
      error:
        "Could not find a valid Swagger/OpenAPI specification at the provided URL",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to import Swagger spec: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
