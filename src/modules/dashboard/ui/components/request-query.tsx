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
import { Trash2Icon } from "lucide-react";

const URLParams = () => {
  return (
    <Card className="!gap-2 p-3">
      <CardHeader className="m-0 p-0">
        <CardTitle>URL Params</CardTitle>
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
      </CardContent>
    </Card>
  );
};

const QueryParams = () => {
  return (
    <Card className="!gap-2 p-3">
      <CardHeader className="m-0 p-0">
        <CardTitle>Query Params</CardTitle>
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
      </CardContent>
    </Card>
  );
};

export const RequestQuery = () => {
  return (
    <div className="space-y-4">
      <QueryParams />
      <URLParams />
    </div>
  );
};
