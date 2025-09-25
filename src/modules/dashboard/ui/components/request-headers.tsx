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
import { useCallback } from "react";

interface HeadersTableProps {
  title: string;
  headers: QueryParam[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<QueryParam>) => void;
  onRemove: (id: string) => void;
}

const HeadersTable = ({
  title,
  headers,
  onAdd,
  onUpdate,
  onRemove,
}: HeadersTableProps) => {
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
            {headers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-8 text-center"
                >
                  No headers added yet
                </TableCell>
              </TableRow>
            ) : (
              headers.map((header) => (
                <TableRow key={header.id}>
                  <TableCell className="w-10">
                    <Checkbox
                      className="size-5"
                      checked={header.enabled}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(header.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={header.key}
                      onChange={(e) =>
                        handleKeyChange(header.id, e.target.value)
                      }
                      placeholder="Header name"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={header.value}
                      onChange={(e) =>
                        handleValueChange(header.id, e.target.value)
                      }
                      placeholder="Header value"
                    />
                  </TableCell>
                  <TableCell className="w-10">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemove(header.id)}
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

const Headers = () => {
  const { state, addHeader, updateHeader, removeHeader } = useDashboard();

  const handleAdd = useCallback(() => {
    const newHeader: QueryParam = {
      id: Math.random().toString(36).substr(2, 9),
      key: "",
      value: "",
      enabled: true,
    };
    addHeader(newHeader);
  }, [addHeader]);

  return (
    <HeadersTable
      title="Request Headers"
      headers={state.headers}
      onAdd={handleAdd}
      onUpdate={updateHeader}
      onRemove={removeHeader}
    />
  );
};

export const RequestHeaders = () => {
  return (
    <div className="space-y-4">
      <Headers />
    </div>
  );
};
