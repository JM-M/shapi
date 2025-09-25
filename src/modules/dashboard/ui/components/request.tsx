import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestAuth } from "./request-auth";
import { RequestDoc } from "./request-doc";
import { RequestInput } from "./request-input";
import { RequestQuery } from "./request-query";
import { RequestTypes } from "./request-types";

export const Request = () => {
  return (
    <div className="space-y-6 p-2">
      <RequestInput />
      <Tabs defaultValue="docs" className="gap-4">
        <TabsList>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>
        <TabsContent value="docs">
          <RequestDoc />
        </TabsContent>
        <TabsContent value="types">
          <RequestTypes />
        </TabsContent>
        <TabsContent value="query">
          <RequestQuery />
        </TabsContent>
        <TabsContent value="headers">Headers</TabsContent>
        <TabsContent value="auth">
          <RequestAuth />
        </TabsContent>
        <TabsContent value="body">Body</TabsContent>
      </Tabs>
    </div>
  );
};
