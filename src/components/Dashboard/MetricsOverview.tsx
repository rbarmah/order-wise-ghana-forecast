
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface MetricsOverviewProps {
  totalRestaurants: number;
  totalPredictedOrders: number;
  totalExpectedRevenue: number;
  totalPotentialRevenue: number;
  highRiskCount: number;
  lastUpdated: Date;
}

export function MetricsOverview({
  totalRestaurants,
  totalPredictedOrders,
  totalExpectedRevenue,
  totalPotentialRevenue,
  highRiskCount,
  lastUpdated
}: MetricsOverviewProps) {
  const potentialLoss = totalPotentialRevenue - totalExpectedRevenue;
  const riskPercentage = (highRiskCount / totalRestaurants) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">
            Total Restaurants
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{totalRestaurants}</div>
          <p className="text-xs text-blue-600 mt-1">
            Active in prediction model
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">
            Predicted Orders
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{totalPredictedOrders.toLocaleString()}</div>
          <p className="text-xs text-green-600 mt-1">
            Expected for tomorrow
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">
            Expected Revenue
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            GHS {totalExpectedRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-purple-600 mt-1">
            After cancellation adjustments
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">
            At-Risk Revenue
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            GHS {potentialLoss.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={riskPercentage > 30 ? "destructive" : riskPercentage > 15 ? "default" : "secondary"}>
              {highRiskCount} restaurants ({riskPercentage.toFixed(1)}%)
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-1 md:col-span-2 lg:col-span-4">
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
                Next refresh in 5 minutes
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
