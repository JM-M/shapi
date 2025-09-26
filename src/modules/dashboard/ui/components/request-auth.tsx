import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/contexts/dashboard";

export const RequestAuth = () => {
  const { state, setBearerToken } = useDashboard();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bearer-token">Bearer Token</Label>
        <Input
          id="bearer-token"
          type="password"
          placeholder="Enter your Bearer token"
          value={state.bearerToken}
          onChange={(e) => setBearerToken(e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-muted-foreground text-xs">
          This token will be included in the Authorization header as {'"'}Bearer
          [your-token]{'"'}
        </p>
      </div>
    </div>
  );
};
