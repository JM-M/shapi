import { Button } from "@/components/ui/button";
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
import { Trash2Icon } from "lucide-react";

const URLParams = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm">URL Params</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox className="size-5" />
            </TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="w-10">
              <Checkbox className="size-5" />
            </TableCell>
            <TableCell>
              <Input />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Input />
                <Button size="icon" variant="ghost">
                  <Trash2Icon strokeWidth={1.2} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

const QueryParams = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm">Query Params</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox className="size-5" />
            </TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="w-10">
              <Checkbox className="size-5" />
            </TableCell>
            <TableCell>
              <Input />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Input />
                <Button size="icon" variant="ghost">
                  <Trash2Icon strokeWidth={1.2} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export const RequestQuery = () => {
  return (
    <div className="space-y-2">
      <QueryParams />
      <URLParams />
    </div>
  );
};
