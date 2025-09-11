import * as yaml from "js-yaml";

export interface ConversionResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Convert JSON string to YAML string
 */
export function jsonToYaml(jsonString: string): ConversionResult {
  try {
    const jsonData = JSON.parse(jsonString);
    const yamlString = yaml.dump(jsonData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    return {
      success: true,
      data: yamlString,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to convert JSON to YAML",
    };
  }
}

/**
 * Convert YAML string to JSON string
 */
export function yamlToJson(yamlString: string): ConversionResult {
  try {
    const yamlData = yaml.load(yamlString);
    const jsonString = JSON.stringify(yamlData, null, 2);
    return {
      success: true,
      data: jsonString,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to convert YAML to JSON",
    };
  }
}

/**
 * Validate JSON string
 */
export function validateJson(jsonString: string): ConversionResult {
  try {
    const data = JSON.parse(jsonString);
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

/**
 * Validate YAML string
 */
export function validateYaml(yamlString: string): ConversionResult {
  try {
    const data = yaml.load(yamlString);
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid YAML",
    };
  }
}

/**
 * Format JSON string with proper indentation
 */
export function formatJson(jsonString: string): ConversionResult {
  try {
    const data = JSON.parse(jsonString);
    const formatted = JSON.stringify(data, null, 2);
    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to format JSON",
    };
  }
}

/**
 * Format YAML string
 */
export function formatYaml(yamlString: string): ConversionResult {
  try {
    const data = yaml.load(yamlString);
    const formatted = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to format YAML",
    };
  }
}
