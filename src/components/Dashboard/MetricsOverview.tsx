
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MetricsOverviewProps {
  lastUpdated: Date;
}

export function MetricsOverview({
  lastUpdated
}: MetricsOverviewProps) {
  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">
                Last Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              Next refresh in 24 hours
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
