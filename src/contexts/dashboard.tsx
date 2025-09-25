"use client";

import * as yaml from "js-yaml";
import { createContext, ReactNode, useContext, useState } from "react";

export interface SwaggerSpec {
  data: string;
  format: "json" | "yaml";
  url?: string;
  title?: string;
  version?: string;
  description?: string;
}

export interface RequestResponse {
  data: any;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface DashboardState {
  swaggerSpec: SwaggerSpec | null;
  isLoading: boolean;
  error: string | null;
  requestUrl: string;
  requestMethod: string;
  baseUrl: string;
  response: RequestResponse | null;
  isRequestLoading: boolean;
  bearerToken: string;
  requestBody: string;
  requestBodyType: "json";
}

export interface DashboardContextType {
  state: DashboardState;
  setSwaggerSpec: (spec: SwaggerSpec | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetDashboard: () => void;
  setRequestUrl: (url: string) => void;
  setRequestMethod: (method: string) => void;
  setResponse: (response: RequestResponse | null) => void;
  setRequestLoading: (loading: boolean) => void;
  setBearerToken: (token: string) => void;
  setRequestBody: (body: string) => void;
  setRequestBodyType: (type: "json") => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, setState] = useState<DashboardState>({
    swaggerSpec: null,
    isLoading: false,
    error: null,
    requestUrl: "https://jsonplaceholder.typicode.com/posts",
    requestMethod: "GET",
    baseUrl: "",
    response: null,
    isRequestLoading: false,
    bearerToken: "",
    requestBody: "",
    requestBodyType: "json",
  });

  const extractBaseUrl = (spec: SwaggerSpec): string => {
    try {
      const data =
        spec.format === "yaml" ? yaml.load(spec.data) : JSON.parse(spec.data);

      // Check for servers array (OpenAPI 3.0+)
      if (
        data.servers &&
        Array.isArray(data.servers) &&
        data.servers.length > 0
      ) {
        return data.servers[0].url || "";
      }

      // Check for host, basePath, schemes (Swagger 2.0)
      if (data.host) {
        const scheme =
          data.schemes && data.schemes.length > 0 ? data.schemes[0] : "https";
        const basePath = data.basePath || "";
        return `${scheme}://${data.host}${basePath}`;
      }

      // If no server info found, try to extract from the original URL
      if (spec.url) {
        try {
          const url = new URL(spec.url);
          return `${url.protocol}//${url.host}`;
        } catch {
          return "";
        }
      }

      return "";
    } catch {
      return "";
    }
  };

  const setSwaggerSpec = (spec: SwaggerSpec | null) => {
    const baseUrl = spec ? extractBaseUrl(spec) : "";
    setState((prev) => ({
      ...prev,
      swaggerSpec: spec,
      baseUrl,
      error: null, // Clear any previous errors when setting new spec
    }));
  };

  const setLoading = (loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  };

  const clearError = () => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  const setRequestUrl = (url: string) => {
    setState((prev) => ({
      ...prev,
      requestUrl: url,
    }));
  };

  const setRequestMethod = (method: string) => {
    setState((prev) => ({
      ...prev,
      requestMethod: method,
    }));
  };

  const setResponse = (response: RequestResponse | null) => {
    setState((prev) => ({
      ...prev,
      response,
    }));
  };

  const setRequestLoading = (loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isRequestLoading: loading,
    }));
  };

  const setBearerToken = (token: string) => {
    setState((prev) => ({
      ...prev,
      bearerToken: token,
    }));
  };

  const setRequestBody = (body: string) => {
    setState((prev) => ({
      ...prev,
      requestBody: body,
    }));
  };

  const setRequestBodyType = (type: "json") => {
    setState((prev) => ({
      ...prev,
      requestBodyType: type,
    }));
  };

  const resetDashboard = () => {
    setState({
      swaggerSpec: null,
      isLoading: false,
      error: null,
      requestUrl: "https://jsonplaceholder.typicode.com/posts",
      requestMethod: "GET",
      baseUrl: "",
      response: null,
      isRequestLoading: false,
      bearerToken: "",
      requestBody: "",
      requestBodyType: "json",
    });
  };

  const value: DashboardContextType = {
    state,
    setSwaggerSpec,
    setLoading,
    setError,
    clearError,
    resetDashboard,
    setRequestUrl,
    setRequestMethod,
    setResponse,
    setRequestLoading,
    setBearerToken,
    setRequestBody,
    setRequestBodyType,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
