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

export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface LayoutState {
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  layoutType: "2-panel" | "3-panel";
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
  queryParams: QueryParam[];
  pathParams: QueryParam[];
  headers: QueryParam[];
  layout: LayoutState;
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
  addQueryParam: (param: QueryParam) => void;
  updateQueryParam: (id: string, updates: Partial<QueryParam>) => void;
  removeQueryParam: (id: string) => void;
  addPathParam: (param: QueryParam) => void;
  updatePathParam: (id: string, updates: Partial<QueryParam>) => void;
  removePathParam: (id: string) => void;
  syncPathParamsWithUrl: (url: string) => void;
  addHeader: (param: QueryParam) => void;
  updateHeader: (id: string, updates: Partial<QueryParam>) => void;
  removeHeader: (id: string) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleLayoutType: () => void;
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
    requestUrl: "",
    requestMethod: "GET",
    baseUrl: "",
    response: null,
    isRequestLoading: false,
    bearerToken: "",
    requestBody: "",
    requestBodyType: "json",
    queryParams: [],
    pathParams: [],
    headers: [],
    layout: {
      leftPanelVisible: true,
      rightPanelVisible: true,
      layoutType: "2-panel",
    },
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

  const addQueryParam = (param: QueryParam) => {
    setState((prev) => ({
      ...prev,
      queryParams: [...prev.queryParams, param],
    }));
  };

  const updateQueryParam = (id: string, updates: Partial<QueryParam>) => {
    setState((prev) => ({
      ...prev,
      queryParams: prev.queryParams.map((param) =>
        param.id === id ? { ...param, ...updates } : param,
      ),
    }));
  };

  const removeQueryParam = (id: string) => {
    setState((prev) => ({
      ...prev,
      queryParams: prev.queryParams.filter((param) => param.id !== id),
    }));
  };

  const addPathParam = (param: QueryParam) => {
    setState((prev) => ({
      ...prev,
      pathParams: [...prev.pathParams, param],
    }));
  };

  const updatePathParam = (id: string, updates: Partial<QueryParam>) => {
    setState((prev) => ({
      ...prev,
      pathParams: prev.pathParams.map((param) =>
        param.id === id ? { ...param, ...updates } : param,
      ),
    }));
  };

  const removePathParam = (id: string) => {
    setState((prev) => ({
      ...prev,
      pathParams: prev.pathParams.filter((param) => param.id !== id),
    }));
  };

  const syncPathParamsWithUrl = (url: string) => {
    const pathParamKeys =
      url.match(/\{([^}]+)\}/g)?.map((match) => match.slice(1, -1)) || [];

    setState((prev) => {
      const existingParams = prev.pathParams;
      const newParams: QueryParam[] = [];

      // Create params for new keys
      pathParamKeys.forEach((key) => {
        const existingParam = existingParams.find((param) => param.key === key);
        if (existingParam) {
          newParams.push(existingParam);
        } else {
          newParams.push({
            id: Math.random().toString(36).substr(2, 9),
            key,
            value: "",
            enabled: true,
          });
        }
      });

      return {
        ...prev,
        pathParams: newParams,
      };
    });
  };

  const addHeader = (param: QueryParam) => {
    setState((prev) => ({
      ...prev,
      headers: [...prev.headers, param],
    }));
  };

  const updateHeader = (id: string, updates: Partial<QueryParam>) => {
    setState((prev) => ({
      ...prev,
      headers: prev.headers.map((param) =>
        param.id === id ? { ...param, ...updates } : param,
      ),
    }));
  };

  const removeHeader = (id: string) => {
    setState((prev) => ({
      ...prev,
      headers: prev.headers.filter((param) => param.id !== id),
    }));
  };

  const toggleLeftPanel = () => {
    setState((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        leftPanelVisible: !prev.layout.leftPanelVisible,
      },
    }));
  };

  const toggleRightPanel = () => {
    setState((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        rightPanelVisible: !prev.layout.rightPanelVisible,
      },
    }));
  };

  const toggleLayoutType = () => {
    setState((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        layoutType:
          prev.layout.layoutType === "2-panel" ? "3-panel" : "2-panel",
      },
    }));
  };

  const resetDashboard = () => {
    setState({
      swaggerSpec: null,
      isLoading: false,
      error: null,
      requestUrl: "",
      requestMethod: "GET",
      baseUrl: "",
      response: null,
      isRequestLoading: false,
      bearerToken: "",
      requestBody: "",
      requestBodyType: "json",
      queryParams: [],
      pathParams: [],
      headers: [],
      layout: {
        leftPanelVisible: true,
        rightPanelVisible: true,
        layoutType: "2-panel",
      },
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
    addQueryParam,
    updateQueryParam,
    removeQueryParam,
    addPathParam,
    updatePathParam,
    removePathParam,
    syncPathParamsWithUrl,
    addHeader,
    updateHeader,
    removeHeader,
    toggleLeftPanel,
    toggleRightPanel,
    toggleLayoutType,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
