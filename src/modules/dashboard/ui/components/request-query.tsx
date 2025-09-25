import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboard, type QueryParam } from "@/contexts/dashboard";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect } from "react";

interface ParamsTableProps {
  title: string;
  params: QueryParam[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<QueryParam>) => void;
  onRemove: (id: string) => void;
}

const ParamsTable = ({
  title,
  params,
  onAdd,
  onUpdate,
  onRemove,
}: ParamsTableProps) => {
  const handleCheckboxChange = useCallback(
    (id: string, enabled: boolean) => {
      onUpdate(id, { enabled });
    },
    [onUpdate],
  );

  const handleKeyChange = useCallback(
    (id: string, key: string) => {
      onUpdate(id, { key });
    },
    [onUpdate],
  );

  const handleValueChange = useCallback(
    (id: string, value: string) => {
      onUpdate(id, { value });
    },
    [onUpdate],
  );

  return (
    <Card className="!gap-2 p-3">
      <CardHeader className="m-0 p-0">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button size="sm" variant="outline" onClick={onAdd}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox className="size-5" />
              </TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-8 text-center"
                >
                  No parameters added yet
                </TableCell>
              </TableRow>
            ) : (
              params.map((param) => (
                <TableRow key={param.id}>
                  <TableCell className="w-10">
                    <Checkbox
                      className="size-5"
                      checked={param.enabled}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(param.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={param.key}
                      onChange={(e) =>
                        handleKeyChange(param.id, e.target.value)
                      }
                      placeholder="Parameter name"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={param.value}
                      onChange={(e) =>
                        handleValueChange(param.id, e.target.value)
                      }
                      placeholder="Parameter value"
                    />
                  </TableCell>
                  <TableCell className="w-10">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemove(param.id)}
                    >
                      <Trash2Icon strokeWidth={1.2} className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const PathParams = () => {
  const { state, updatePathParam, syncPathParamsWithUrl } = useDashboard();

  // Sync path parameters when the URL changes
  useEffect(() => {
    if (state.requestUrl) {
      syncPathParamsWithUrl(state.requestUrl);
    }
  }, [state.requestUrl]); // Remove syncPathParamsWithUrl from dependencies to avoid infinite loops

  const handleValueChange = useCallback(
    (id: string, value: string) => {
      updatePathParam(id, { value });
    },
    [updatePathParam],
  );

  if (state.pathParams.length === 0) {
    return (
      <Card className="!gap-2 p-3">
        <CardHeader className="m-0 p-0">
          <CardTitle>Path Params</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-muted-foreground py-8 text-center">
            No path parameters found in URL
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="!gap-2 p-3">
      <CardHeader className="m-0 p-0">
        <CardTitle>Path Params</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.pathParams.map((param) => (
              <TableRow key={param.id}>
                <TableCell>
                  <div className="text-muted-foreground font-mono text-sm">
                    {`{${param.key}}`}
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={param.value}
                    onChange={(e) =>
                      handleValueChange(param.id, e.target.value)
                    }
                    placeholder={`Enter ${param.key} value`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const QueryParams = () => {
  const { state, addQueryParam, updateQueryParam, removeQueryParam } =
    useDashboard();

  const handleAdd = useCallback(() => {
    const newParam: QueryParam = {
      id: Math.random().toString(36).substr(2, 9),
      key: "",
      value: "",
      enabled: true,
    };
    addQueryParam(newParam);
  }, [addQueryParam]);

  return (
    <ParamsTable
      title="Query Params"
      params={state.queryParams}
      onAdd={handleAdd}
      onUpdate={updateQueryParam}
      onRemove={removeQueryParam}
    />
  );
};

export const RequestQuery = () => {
  return (
    <div className="space-y-4">
      <QueryParams />
      <PathParams />
    </div>
  );
};
