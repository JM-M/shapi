import { CodeEditor } from "@/components/code-editor";
import { useDashboard } from "@/contexts/dashboard";

export const Response = () => {
  const { state } = useDashboard();

  const formatResponseData = () => {
    if (!state.response) return "";

    const responseObj = {
      status: state.response.status,
      statusText: state.response.statusText,
      headers: state.response.headers,
      data: state.response.data,
    };

    return JSON.stringify(responseObj, null, 2);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-700";
    if (status >= 300 && status < 400) return "bg-yellow-700";
    if (status >= 400 && status < 500) return "bg-orange-700";
    if (status >= 500) return "bg-red-700";
    return "bg-gray-700";
  };

  if (!state.response) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground text-center">
          <p>No response yet. Send a request to see the response here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Response</h3>
          <div className="flex items-center gap-2">
            <div
              className={`rounded px-2 py-1 text-xs font-medium text-white ${getStatusColor(state.response.status)}`}
            >
              {state.response.status} {state.response.statusText}
            </div>
          </div>
        </div>
        <CodeEditor
          value={formatResponseData()}
          onChange={() => {}}
          placeholder=""
          readOnly
          hideCursor
          showCopyButton
        />
      </div>
    </div>
  );
};
