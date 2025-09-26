/* eslint-disable @typescript-eslint/no-explicit-any */

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/contexts/dashboard";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { SendHorizonalIcon } from "lucide-react";

export const RequestInput = () => {
  const {
    state,
    setRequestUrl,
    setRequestMethod,
    setResponse,
    setRequestLoading,
    setError,
    syncPathParamsWithUrl,
  } = useDashboard();

  // Helper function to get the path part from a full URL
  const getPathFromUrl = (url: string, baseUrl: string): string => {
    if (!baseUrl || !url.startsWith(baseUrl)) {
      return url;
    }
    return url.substring(baseUrl.length);
  };

  // Helper function to build URL with path and query parameters for display
  const buildUrlWithParams = (
    baseUrl: string,
    pathParams: any[],
    queryParams: any[],
  ): string => {
    if (!baseUrl) return "";

    // Replace path parameters
    let urlWithPathParams = baseUrl;
    pathParams.forEach((param) => {
      if (param.value.trim()) {
        urlWithPathParams = urlWithPathParams.replace(
          `{${param.key}}`,
          encodeURIComponent(param.value),
        );
      }
    });

    // Add query parameters
    const enabledQueryParams = queryParams.filter(
      (param) => param.enabled && param.key.trim() && param.value.trim(),
    );

    if (enabledQueryParams.length === 0) {
      return urlWithPathParams;
    }

    const queryString = enabledQueryParams
      .map(
        (param) =>
          `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`,
      )
      .join("&");

    return `${urlWithPathParams}${urlWithPathParams.includes("?") ? "&" : "?"}${queryString}`;
  };

  // Helper function to extract base URL from full URL with query params
  const extractBaseUrl = (fullUrl: string): string => {
    try {
      const url = new URL(fullUrl);
      return `${url.protocol}//${url.host}${url.pathname}`;
    } catch {
      return fullUrl;
    }
  };

  // Helper function to extract path parameter keys from URL
  const extractPathParamKeys = (url: string): string[] => {
    const matches = url.match(/\{([^}]+)\}/g);
    return matches ? matches.map((match) => match.slice(1, -1)) : [];
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["dashboard"],
    mutationFn: async () => {
      if (!state.requestUrl) {
        throw new Error("Please enter a URL");
      }

      setRequestLoading(true);
      setError(null);
      setResponse(null);

      try {
        const headers: Record<string, string> = {};

        // Add Bearer token if available
        if (state.bearerToken) {
          headers.Authorization = `Bearer ${state.bearerToken}`;
        }

        // Add custom headers
        const enabledHeaders = state.headers.filter(
          (header) =>
            header.enabled && header.key.trim() && header.value.trim(),
        );

        enabledHeaders.forEach((header) => {
          headers[header.key] = header.value;
        });

        // Build URL with path parameters
        let finalUrl = state.requestUrl;
        const enabledPathParams = state.pathParams.filter(
          (param) => param.enabled && param.key.trim() && param.value.trim(),
        );

        if (enabledPathParams.length > 0) {
          const urlObj = new URL(finalUrl);
          enabledPathParams.forEach((param) => {
            urlObj.pathname = urlObj.pathname.replace(
              `{${param.key}}`,
              param.value,
            );
          });
          finalUrl = urlObj.toString();
        }

        // Build query parameters
        const params: Record<string, string> = {};
        const enabledQueryParams = state.queryParams.filter(
          (param) => param.enabled && param.key.trim() && param.value.trim(),
        );

        enabledQueryParams.forEach((param) => {
          params[param.key] = param.value;
        });

        // Prepare request data
        let data: any = undefined;
        if (
          state.requestBody.trim() &&
          (state.requestMethod === "POST" ||
            state.requestMethod === "PUT" ||
            state.requestMethod === "PATCH")
        ) {
          try {
            data = JSON.parse(state.requestBody);
            headers["Content-Type"] = "application/json";
          } catch (error) {
            throw new Error("Invalid JSON in request body");
          }
        }

        const response = await axios({
          method: state.requestMethod.toLowerCase() as any,
          url: finalUrl,
          params,
          headers,
          data,
          timeout: 10000, // 10 second timeout
        });

        const responseData = {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
        };

        setResponse(responseData);
        return responseData;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || "Request failed";
        setError(errorMessage);

        // Still set response for error cases to show error details
        if (error.response) {
          setResponse({
            data: error.response.data,
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers as Record<string, string>,
          });
        }

        throw error;
      } finally {
        setRequestLoading(false);
      }
    },
  });

  return (
    <div className="relative h-fit w-full rounded-md backdrop-blur-lg">
      <Select value={state.requestMethod} onValueChange={setRequestMethod}>
        <SelectTrigger className="absolute top-[2px] left-[2px] !h-[calc(100%-4px)] w-24 border-none text-xs font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GET">GET</SelectItem>
          <SelectItem value="POST">POST</SelectItem>
          <SelectItem value="PUT">PUT</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Enter or pasteURL"
        className="w-full pr-24 pl-24"
        value={buildUrlWithParams(
          state.requestUrl,
          state.pathParams,
          state.queryParams,
        )}
        onChange={(e) => {
          const newValue = e.target.value;
          const baseUrl = extractBaseUrl(newValue);
          setRequestUrl(baseUrl);
          syncPathParamsWithUrl(baseUrl);
        }}
      />
      <Button
        variant="secondary"
        className="absolute top-[2px] right-[2px] h-[calc(100%-4px)]"
        onClick={() => mutate()}
        disabled={isPending || state.isRequestLoading}
      >
        Send{" "}
        {isPending || state.isRequestLoading ? (
          <Spinner />
        ) : (
          <SendHorizonalIcon />
        )}
      </Button>
    </div>
  );
};
