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
  } = useDashboard();

  // Helper function to get the path part from a full URL
  const getPathFromUrl = (url: string, baseUrl: string): string => {
    if (!baseUrl || !url.startsWith(baseUrl)) {
      return url;
    }
    return url.substring(baseUrl.length);
  };

  // Helper function to build full URL from path
  const buildFullUrl = (path: string, baseUrl: string): string => {
    if (!baseUrl) return path;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path; // Already a full URL
    }
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
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
        const response = await axios({
          method: state.requestMethod.toLowerCase() as any,
          url: state.requestUrl,
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
    <div className="relative h-fit w-full">
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
        value={state.requestUrl}
        onChange={(e) => {
          const newValue = e.target.value;
          const fullUrl = buildFullUrl(newValue, state.baseUrl);
          setRequestUrl(fullUrl);
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
