import { CodeEditor } from "@/components/code-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-yellow-500";
    if (status >= 400 && status < 500) return "bg-orange-500";
    if (status >= 500) return "bg-red-500";
    return "bg-gray-500";
  };

  if (!state.response) {
    return (
      <div className="p-2">
        <Card>
          <CardContent className="p-6">
            <div className="text-muted-foreground text-center">
              <p>No response yet. Send a request to see the response here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Response</CardTitle>
            <div className="flex items-center gap-2">
              <div
                className={`rounded px-2 py-1 text-xs font-medium text-white ${getStatusColor(state.response.status)}`}
              >
                {state.response.status} {state.response.statusText}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CodeEditor
            value={formatResponseData()}
            onChange={() => {}}
            placeholder=""
            readOnly
            hideCursor
          />
        </CardContent>
      </Card>
    </div>
  );
};
