import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestAuth } from "./request-auth";
import { RequestDoc } from "./request-doc";
import { RequestInput } from "./request-input";
import { RequestQuery } from "./request-query";
import { RequestTypes } from "./request-types";

export const Request = () => {
  return (
    <div className="h-full space-y-6 p-2">
      <RequestInput />
      <Tabs defaultValue="docs" className="flex h-full flex-col gap-4">
        <TabsList>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>
        <TabsContent value="docs" className="flex-1">
          <RequestDoc />
        </TabsContent>
        <TabsContent value="types" className="flex-1">
          <RequestTypes />
        </TabsContent>
        <TabsContent value="query" className="flex-1">
          <RequestQuery />
        </TabsContent>
        <TabsContent value="headers" className="flex-1">
          Headers
        </TabsContent>
        <TabsContent value="auth" className="flex-1">
          <RequestAuth />
        </TabsContent>
        <TabsContent value="body" className="flex-1">
          Body
        </TabsContent>
      </Tabs>
    </div>
  );
};
