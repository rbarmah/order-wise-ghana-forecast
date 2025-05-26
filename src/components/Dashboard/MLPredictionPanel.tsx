
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Target, DollarSign, MapPin, Phone, Clock, Filter } from "lucide-react";
import { PredictionData, Restaurant } from "@/utils/dummyData";
import { useState } from "react";

interface MLPredictionPanelProps {
  predictions: PredictionData[];
  restaurants: Restaurant[];
}

export function MLPredictionPanel({ predictions, restaurants }: MLPredictionPanelProps) {
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [revenueFilter, setRevenueFilter] = useState<string>("all");

  // Create restaurant lookup
  const restaurantMap = new Map(restaurants.map(r => [r.id, r]));

  // Filter predictions based on selected filters
  const filteredPredictions = predictions.filter((prediction) => {
    const restaurant = restaurantMap.get(prediction.restaurantId);
    if (!restaurant) return false;

    // Risk filter
    if (riskFilter !== "all" && prediction.riskLevel !== riskFilter) {
      return false;
    }

    // Revenue filter
    if (revenueFilter !== "all") {
      if (revenueFilter === "low" && prediction.expectedRevenue >= 500) return false;
      if (revenueFilter === "medium" && (prediction.expectedRevenue < 500 || prediction.expectedRevenue >= 1000)) return false;
      if (revenueFilter === "high" && prediction.expectedRevenue < 1000) return false;
    }

    return true;
  });

  const handleCardClick = (restaurantId: string) => {
    console.log(`Clicked on restaurant: ${restaurantId}`);
    // This can be expanded to navigate to detailed view or show modal
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ML Prediction Overview</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Model Accuracy: 92.3%
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            MAPE: 8.7%
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Risk Level:</span>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Revenue Range:</span>
          <Select value={revenueFilter} onValueChange={setRevenueFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">< GHS 500</SelectItem>
              <SelectItem value="medium">GHS 500-1000</SelectItem>
              <SelectItem value="high">> GHS 1000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredPredictions.length} of {predictions.length} retailers
        </div>
      </div>

      {/* Retailer Prediction Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Retailer ML Predictions ({filteredPredictions.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredPredictions.map((prediction) => {
            const restaurant = restaurantMap.get(prediction.restaurantId);
            if (!restaurant) return null;

            return (
              <Card 
                key={prediction.restaurantId}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                onClick={() => handleCardClick(prediction.restaurantId)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium text-gray-900 leading-tight">
                        {restaurant.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {restaurant.zone}
                      </div>
                    </div>
                    {getRiskBadge(prediction.riskLevel)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Historical Avg</p>
                      <p className="font-medium text-gray-700">{restaurant.avgDailyOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Predicted Order Volume</p>
                      <p className="font-medium text-blue-600">{prediction.predictedOrders}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Expected Revenue:</span>
                      <span className="font-medium text-green-600">GHS {prediction.expectedRevenue}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Potential Revenue:</span>
                      <span className="font-medium text-purple-600">GHS {prediction.potentialRevenue}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                    <Clock className="h-3 w-3" />
                    <span>Peak: {restaurant.peakHour}:00</span>
                    <span>•</span>
                    <Phone className="h-3 w-3" />
                    <span>{restaurant.contact}</span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Confidence: {Math.round(prediction.confidenceInterval.lower)}-{Math.round(prediction.confidenceInterval.upper)} orders
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
