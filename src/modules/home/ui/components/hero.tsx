import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Hero = () => {
  return (
    <header className="flex flex-col items-center justify-center space-y-10 py-36">
      <div className="border-bg-muted max-auto flex min-h-32 w-lg flex-col gap-2 rounded-xl border p-2">
        <Textarea
          placeholder="Paste OpenAPI/Swagger url, file or text"
          className="text-muted-foreground flex-1 p-2 text-sm"
        />
        <div className="mt-auto flex items-center justify-end">
          <Button>Paste File</Button>
        </div>
      </div>
    </header>
  );
};
