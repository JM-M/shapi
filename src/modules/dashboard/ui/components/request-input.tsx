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
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { SendHorizonalIcon } from "lucide-react";
import { useState } from "react";

export const RequestInput = () => {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts");

  const { mutate, isPending } = useMutation({
    mutationKey: ["dashboard"],
    mutationFn: async () => {
      return await axios.get("/api/request/input");
    },
  });

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
      <Input
        placeholder="Enter or pasteURL"
        className="w-full pr-24 pl-24"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button
        variant="secondary"
        className="absolute top-[2px] right-[2px] h-[calc(100%-4px)]"
        onClick={() => mutate()}
        disabled={isPending}
      >
        Send {isPending ? <Spinner /> : <SendHorizonalIcon />}
      </Button>
    </div>
  );
};
