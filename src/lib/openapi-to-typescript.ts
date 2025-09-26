/* eslint-disable @typescript-eslint/no-explicit-any */

import * as yaml from "js-yaml";

export interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
  definitions?: Record<string, any>; // Swagger 2.0
}

export interface TypeScriptType {
  name: string;
  definition: string;
}

/**
 * Convert OpenAPI schema to TypeScript type definition
 */
export function schemaToTypeScript(schema: any, name: string = "Type"): string {
  if (!schema) return `type ${name} = any;`;

  // Handle references
  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop() || "Unknown";
    return `type ${name} = ${refName};`;
  }

  // Handle different schema types
  switch (schema.type) {
    case "string":
      if (schema.enum) {
        return `type ${name} = ${schema.enum.map((v: any) => `"${v}"`).join(" | ")};`;
      }
      return `type ${name} = string;`;

    case "number":
    case "integer":
      return `type ${name} = number;`;

    case "boolean":
      return `type ${name} = boolean;`;

    case "array":
      const itemType = schema.items
        ? schemaToTypeScript(schema.items, "Item")
        : "any";
      return `type ${name} = ${itemType.replace(/^type Item = /, "").replace(/;$/, "")}[];`;

    case "object":
      if (schema.properties) {
        const properties = Object.entries(schema.properties)
          .map(([key, value]: [string, any]) => {
            const isOptional = !schema.required?.includes(key);
            const propType = schemaToTypeScript(
              value,
              `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`,
            );
            const typeDef = propType
              .replace(/^type \w+ = /, "")
              .replace(/;$/, "");
            return `  ${key}${isOptional ? "?" : ""}: ${typeDef};`;
          })
          .join("\n");
        return `interface ${name} {\n${properties}\n}`;
      }
      return `type ${name} = Record<string, any>;`;

    default:
      return `type ${name} = any;`;
  }
}

/**
 * Extract request and response schemas from OpenAPI operation
 */
export function extractOperationSchemas(operation: any): {
  requestSchema?: any;
  responseSchema?: any;
} {
  const requestSchema =
    operation.requestBody?.content?.["application/json"]?.schema ||
    operation.requestBody?.content?.["application/x-www-form-urlencoded"]
      ?.schema ||
    operation.parameters?.find((p: any) => p.in === "body")?.schema;

  // Get the first successful response (200, 201, etc.)
  const responseSchema =
    operation.responses?.["200"]?.content?.["application/json"]?.schema ||
    operation.responses?.["201"]?.content?.["application/json"]?.schema ||
    operation.responses?.["default"]?.content?.["application/json"]?.schema ||
    (Object.values(operation.responses || {}) as any[]).find(
      (r: any) => r.content?.["application/json"]?.schema,
    )?.content?.["application/json"]?.schema;

  return { requestSchema, responseSchema };
}

/**
 * Get all schema definitions from OpenAPI spec
 */
export function getSchemaDefinitions(spec: OpenAPISpec): Record<string, any> {
  // OpenAPI 3.0+
  if (spec.components?.schemas) {
    return spec.components.schemas;
  }

  // Swagger 2.0
  if (spec.definitions) {
    return spec.definitions;
  }

  return {};
}

/**
 * Resolve schema references
 */
export function resolveSchemaRef(
  schema: any,
  definitions: Record<string, any>,
): any {
  if (schema.$ref) {
    const refPath = schema.$ref.replace("#/", "").split("/");
    let resolved = definitions;

    for (const part of refPath) {
      if (
        part === "components" ||
        part === "schemas" ||
        part === "definitions"
      ) {
        continue;
      }
      resolved = resolved[part];
      if (!resolved) break;
    }

    return resolved || schema;
  }

  return schema;
}

/**
 * Generate TypeScript types for a specific endpoint
 */
export function generateEndpointTypes(
  spec: OpenAPISpec,
  path: string,
  method: string,
): { requestType?: TypeScriptType; responseType?: TypeScriptType } {
  const pathItem = spec.paths[path];
  if (!pathItem) return {};

  const operation = pathItem[method.toLowerCase()];
  if (!operation) return {};

  const definitions = getSchemaDefinitions(spec);
  const { requestSchema, responseSchema } = extractOperationSchemas(operation);

  const result: {
    requestType?: TypeScriptType;
    responseType?: TypeScriptType;
  } = {};

  if (requestSchema) {
    const resolvedRequestSchema = resolveSchemaRef(requestSchema, definitions);
    const requestTypeName = `${method.toUpperCase()}${path.replace(/[^a-zA-Z0-9]/g, "")}Request`;
    result.requestType = {
      name: requestTypeName,
      definition: schemaToTypeScript(resolvedRequestSchema, requestTypeName),
    };
  }

  if (responseSchema) {
    const resolvedResponseSchema = resolveSchemaRef(
      responseSchema,
      definitions,
    );
    const responseTypeName = `${method.toUpperCase()}${path.replace(/[^a-zA-Z0-9]/g, "")}Response`;
    result.responseType = {
      name: responseTypeName,
      definition: schemaToTypeScript(resolvedResponseSchema, responseTypeName),
    };
  }

  return result;
}

/**
 * Parse OpenAPI spec from string
 */
export function parseOpenAPISpec(
  data: string,
  format: "json" | "yaml",
): OpenAPISpec | null {
  try {
    const spec = format === "yaml" ? yaml.load(data) : JSON.parse(data);
    return spec as OpenAPISpec;
  } catch (error) {
    console.error("Failed to parse OpenAPI spec:", error);
    return null;
  }
}
