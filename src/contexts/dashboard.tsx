"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface SwaggerSpec {
  data: string;
  format: "json" | "yaml";
  url?: string;
  title?: string;
  version?: string;
  description?: string;
}

export interface DashboardState {
  swaggerSpec: SwaggerSpec | null;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardContextType {
  state: DashboardState;
  setSwaggerSpec: (spec: SwaggerSpec | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetDashboard: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

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
  });

  const setSwaggerSpec = (spec: SwaggerSpec | null) => {
    setState((prev) => ({
      ...prev,
      swaggerSpec: spec,
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

  const resetDashboard = () => {
    setState({
      swaggerSpec: null,
      isLoading: false,
      error: null,
    });
  };

  const value: DashboardContextType = {
    state,
    setSwaggerSpec,
    setLoading,
    setError,
    clearError,
    resetDashboard,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
