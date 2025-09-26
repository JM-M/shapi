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
  "/swagger/v1/swagger.json",
  "/swagger/v1/swagger.yaml",
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
 * Try to fetch Swagger spec from common endpoints using proxy
 */
async function tryCommonEndpoints(
  baseUrl: string,
): Promise<SwaggerImportResult> {
  for (const endpoint of SWAGGER_ENDPOINTS) {
    try {
      const fullUrl = `${baseUrl}${endpoint}`;
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
      const response = await axios.get(proxyUrl, {
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
 * Try to extract spec URL from Swagger UI page using proxy
 */
async function extractSpecFromSwaggerUI(
  url: string,
): Promise<SwaggerImportResult> {
  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const response = await axios.get(proxyUrl, {
      timeout: 10000,
      headers: {
        Accept:
          "text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
      },
    });

    if (response.status === 200) {
      const html = response.data;

      // Debug: Log the HTML content to help troubleshoot
      console.log("Swagger UI HTML content:", html.substring(0, 1000) + "...");

      // Look for common patterns in Swagger UI HTML
      const patterns = [
        // Original patterns for explicit file extensions
        /url:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /spec-url["']:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /swaggerUrl["']:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /openapiUrl["']:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /"url":\s*"([^"]*\.(?:json|yaml|yml))"/gi,

        // Additional patterns for ASP.NET Core and other frameworks
        /url:\s*["']([^"']*swagger[^"']*\.(?:json|yaml|yml))["']/gi,
        /url:\s*["']([^"']*\/swagger\/[^"']*\.(?:json|yaml|yml))["']/gi,
        /url:\s*["']([^"']*\/v\d+\/[^"']*\.(?:json|yaml|yml))["']/gi,
        /swaggerUrl:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,
        /openapiUrl:\s*["']([^"']*\.(?:json|yaml|yml))["']/gi,

        // More flexible patterns that don't require file extensions
        /url:\s*["']([^"']*swagger[^"']*)["']/gi,
        /url:\s*["']([^"']*\/swagger\/[^"']*)["']/gi,
        /url:\s*["']([^"']*\/v\d+\/[^"']*)["']/gi,

        // Patterns for different Swagger UI configurations
        /SwaggerUIBundle\({\s*url:\s*["']([^"']*)["']/gi,
        /SwaggerUI\({\s*url:\s*["']([^"']*)["']/gi,
        /window\.ui\s*=\s*SwaggerUIBundle\({\s*url:\s*["']([^"']*)["']/gi,
      ];

      for (const pattern of patterns) {
        const matches = html.match(pattern);
        if (matches) {
          for (const match of matches) {
            // Extract URL from the match with multiple fallback strategies
            const urlMatch = match.match(/([^"']*\.(?:json|yaml|yml))/);
            const urlMatchNoExt = match.match(/([^"']*swagger[^"']*)/);
            const urlMatchSwaggerPath = match.match(
              /([^"']*\/swagger\/[^"']*)/,
            );
            const urlMatchVersionPath = match.match(/([^"']*\/v\d+\/[^"']*)/);
            const urlMatchGeneric = match.match(/([^"']*)/);

            let specUrl =
              urlMatch?.[1] ||
              urlMatchNoExt?.[1] ||
              urlMatchSwaggerPath?.[1] ||
              urlMatchVersionPath?.[1] ||
              urlMatchGeneric?.[1];

            if (specUrl) {
              // Clean up the URL
              specUrl = specUrl.trim();

              console.log("Found potential spec URL:", specUrl);

              // Add .json extension if missing and it looks like a spec URL
              if (
                !specUrl.endsWith(".json") &&
                !specUrl.endsWith(".yaml") &&
                !specUrl.endsWith(".yml")
              ) {
                if (
                  specUrl.includes("swagger") ||
                  specUrl.includes("/v") ||
                  specUrl.includes("api-docs")
                ) {
                  specUrl += ".json";
                  console.log("Added .json extension:", specUrl);
                }
              }

              // Make URL absolute if it's relative
              if (specUrl.startsWith("/")) {
                const baseUrl = getBaseUrl(url);
                specUrl = `${baseUrl}${specUrl}`;
              } else if (!specUrl.startsWith("http")) {
                const baseUrl = getBaseUrl(url);
                specUrl = `${baseUrl}/${specUrl}`;
              }

              console.log("Attempting to fetch spec from:", specUrl);

              try {
                const specProxyUrl = `/api/proxy?url=${encodeURIComponent(specUrl)}`;
                const specResponse = await axios.get(specProxyUrl, {
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

    // If HTML extraction failed, try common endpoints as a fallback
    console.log("HTML extraction failed, trying common endpoints as fallback");
    const baseUrl = getBaseUrl(url);
    const fallbackResult = await tryCommonEndpoints(baseUrl);
    if (fallbackResult.success) {
      return fallbackResult;
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

    // First, try to fetch the URL directly through proxy (in case it's already a spec file)
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(cleanUrl)}`;
      const directResponse = await axios.get(proxyUrl, {
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
