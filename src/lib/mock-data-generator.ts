/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  OpenAPISpec,
  getSchemaDefinitions,
  resolveSchemaRef,
} from "./openapi-to-typescript";

/**
 * Generate mock data from OpenAPI schema
 */
export function generateMockData(
  schema: any,
  definitions: Record<string, any> = {},
): any {
  if (!schema) return null;

  // Handle references
  if (schema.$ref) {
    const resolvedSchema = resolveSchemaRef(schema, definitions);
    return generateMockData(resolvedSchema, definitions);
  }

  // Handle different schema types
  switch (schema.type) {
    case "string":
      if (schema.enum) {
        return schema.enum[0]; // Return first enum value
      }
      if (schema.format === "email") {
        return "user@example.com";
      }
      if (schema.format === "date") {
        return "2024-01-01";
      }
      if (schema.format === "date-time") {
        return "2024-01-01T00:00:00Z";
      }
      if (schema.format === "uuid") {
        return "123e4567-e89b-12d3-a456-426614174000";
      }
      if (schema.format === "uri") {
        return "https://example.com";
      }
      return "string";

    case "number":
    case "integer":
      if (schema.minimum !== undefined && schema.maximum !== undefined) {
        return Math.floor((schema.minimum + schema.maximum) / 2);
      }
      if (schema.minimum !== undefined) {
        return schema.minimum + 1;
      }
      if (schema.maximum !== undefined) {
        return Math.max(1, schema.maximum - 1);
      }
      return 42;

    case "boolean":
      return true;

    case "array":
      if (schema.items) {
        const itemMock = generateMockData(schema.items, definitions);
        return schema.minItems ? [itemMock] : [itemMock];
      }
      return [];

    case "object":
      if (schema.properties) {
        const mockObject: any = {};
        Object.entries(schema.properties).forEach(
          ([key, value]: [string, any]) => {
            const isOptional = !schema.required?.includes(key);
            // Include optional fields sometimes for more realistic mock data
            if (!isOptional || Math.random() > 0.3) {
              mockObject[key] = generateMockData(value, definitions);
            }
          },
        );
        return mockObject;
      }
      return {};

    default:
      return null;
  }
}

/**
 * Generate mock data for a specific endpoint request body
 */
export function generateEndpointMockData(
  spec: OpenAPISpec,
  path: string,
  method: string,
): any {
  const pathItem = spec.paths[path];
  if (!pathItem) return null;

  const operation = pathItem[method.toLowerCase()];
  if (!operation) return null;

  const definitions = getSchemaDefinitions(spec);

  // Get request body schema
  const requestSchema =
    operation.requestBody?.content?.["application/json"]?.schema ||
    operation.requestBody?.content?.["application/x-www-form-urlencoded"]
      ?.schema ||
    operation.parameters?.find((p: any) => p.in === "body")?.schema;

  if (!requestSchema) return null;

  const resolvedSchema = resolveSchemaRef(requestSchema, definitions);
  return generateMockData(resolvedSchema, definitions);
}

/**
 * Generate mock data with more realistic values for common field names
 */
export function generateRealisticMockData(
  schema: any,
  definitions: Record<string, any> = {},
): any {
  if (!schema) return null;

  // Handle references
  if (schema.$ref) {
    const resolvedSchema = resolveSchemaRef(schema, definitions);
    return generateRealisticMockData(resolvedSchema, definitions);
  }

  // Handle different schema types
  switch (schema.type) {
    case "string":
      if (schema.enum) {
        return schema.enum[0];
      }
      if (schema.format === "email") {
        return "john.doe@example.com";
      }
      if (schema.format === "date") {
        return "2024-01-15";
      }
      if (schema.format === "date-time") {
        return "2024-01-15T10:30:00Z";
      }
      if (schema.format === "uuid") {
        return "550e8400-e29b-41d4-a716-446655440000";
      }
      if (schema.format === "uri") {
        return "https://api.example.com/v1/users";
      }
      return "Sample text";

    case "number":
    case "integer":
      if (schema.minimum !== undefined && schema.maximum !== undefined) {
        return Math.floor((schema.minimum + schema.maximum) / 2);
      }
      if (schema.minimum !== undefined) {
        return schema.minimum + 1;
      }
      if (schema.maximum !== undefined) {
        return Math.max(1, schema.maximum - 1);
      }
      return 100;

    case "boolean":
      return true;

    case "array":
      if (schema.items) {
        const itemMock = generateRealisticMockData(schema.items, definitions);
        return schema.minItems ? [itemMock] : [itemMock];
      }
      return [];

    case "object":
      if (schema.properties) {
        const mockObject: any = {};
        Object.entries(schema.properties).forEach(
          ([key, value]: [string, any]) => {
            const isOptional = !schema.required?.includes(key);
            // Include optional fields sometimes for more realistic mock data
            if (!isOptional || Math.random() > 0.3) {
              mockObject[key] = generateRealisticMockData(value, definitions);
            }
          },
        );
        return mockObject;
      }
      return {};

    default:
      return null;
  }
}
