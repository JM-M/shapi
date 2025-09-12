import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SendHorizonalIcon } from "lucide-react";

export const RequestInput = () => {
  return (
    <div className="relative h-fit w-full">
      <Select defaultValue="GET">
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
      <Input placeholder="Enter or pasteURL" className="w-full pr-24 pl-24" />
      <Button
        variant="secondary"
        className="absolute top-[2px] right-[2px] h-[calc(100%-4px)]"
      >
        Send <SendHorizonalIcon />
      </Button>
    </div>
  );
};
