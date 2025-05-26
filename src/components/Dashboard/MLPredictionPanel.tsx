
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, DollarSign, MapPin, Phone, Clock } from "lucide-react";
import { PredictionData, Restaurant } from "@/utils/dummyData";

interface MLPredictionPanelProps {
  predictions: PredictionData[];
  restaurants: Restaurant[];
}

export function MLPredictionPanel({ predictions, restaurants }: MLPredictionPanelProps) {
  // Create restaurant lookup
  const restaurantMap = new Map(restaurants.map(r => [r.id, r]));

  const totalPredicted = predictions.reduce((sum, p) => sum + p.predictedOrders, 0);
  const totalExpected = predictions.reduce((sum, p) => sum + p.expectedRevenue, 0);
  const totalPotential = predictions.reduce((sum, p) => sum + p.potentialRevenue, 0);

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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Daily Predicted Orders
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalPredicted.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">
              +12.3% vs last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Expected Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              GHS {totalExpected.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Adjusted for cancellations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Potential Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              GHS {totalPotential.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              100% fulfillment scenario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Retailer Prediction Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Retailer ML Predictions ({predictions.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {predictions.map((prediction) => {
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
                      <p className="text-gray-500 text-xs">ML Prediction</p>
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
