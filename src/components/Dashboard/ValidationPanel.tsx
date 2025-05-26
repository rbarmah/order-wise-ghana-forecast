
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, CheckCircle, Search } from "lucide-react";
import { PredictionData, Restaurant } from "@/utils/dummyData";

interface ValidationPanelProps {
  predictions: PredictionData[];
  restaurants: Restaurant[];
}

export function ValidationPanel({ predictions, restaurants }: ValidationPanelProps) {
  const [orderThreshold, setOrderThreshold] = useState([25]);
  const [revenueThreshold, setRevenueThreshold] = useState([500]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Create restaurant lookup
  const restaurantMap = new Map(restaurants.map(r => [r.id, r]));

  // Calculate flagged restaurants based on thresholds
  const flaggedRestaurants = predictions.filter(p => 
    p.predictedOrders > orderThreshold[0] || 
    p.expectedRevenue > revenueThreshold[0] ||
    p.riskLevel === 'high'
  );

  // Filter restaurants based on search
  const filteredFlagged = flaggedRestaurants.filter(p => {
    const restaurant = restaurantMap.get(p.restaurantId);
    if (!restaurant) return false;
    return restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           restaurant.zone.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Historical vs Prediction comparison data
  const comparisonData = predictions.slice(0, 20).map(p => {
    const restaurant = restaurantMap.get(p.restaurantId);
    return {
      name: restaurant?.name.split(' ')[0] || 'Unknown',
      predicted: p.predictedOrders,
      historical: restaurant?.avgDailyOrders || 0,
      variance: ((p.predictedOrders - (restaurant?.avgDailyOrders || 0)) / (restaurant?.avgDailyOrders || 1)) * 100
    };
  });

  const toggleRestaurantSelection = (restaurantId: string) => {
    const newSelection = new Set(selectedRestaurants);
    if (newSelection.has(restaurantId)) {
      newSelection.delete(restaurantId);
    } else {
      newSelection.add(restaurantId);
    }
    setSelectedRestaurants(newSelection);
  };

  const selectAll = () => {
    setSelectedRestaurants(new Set(filteredFlagged.map(p => p.restaurantId)));
  };

  const clearAll = () => {
    setSelectedRestaurants(new Set());
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Risk</Badge>;
      default:
        return <Badge variant="secondary">Low Risk</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Prediction Validation</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {flaggedRestaurants.length} Flagged
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {selectedRestaurants.size} Selected
          </Badge>
        </div>
      </div>

      {/* Threshold Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Threshold Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Order Volume Threshold: {orderThreshold[0]} orders</Label>
              <Slider
                value={orderThreshold}
                onValueChange={setOrderThreshold}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Flag restaurants expected to exceed this order volume
              </p>
            </div>
            
            <div className="space-y-3">
              <Label>Revenue Threshold: GHS {revenueThreshold[0]}</Label>
              <Slider
                value={revenueThreshold}
                onValueChange={setRevenueThreshold}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Flag restaurants expected to exceed this revenue
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction vs Historical Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Predictions vs Historical Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} orders`,
                  name === 'predicted' ? 'Predicted' : 'Historical Average'
                ]}
              />
              <Bar dataKey="historical" fill="#94a3b8" name="Historical Average" />
              <Bar dataKey="predicted" fill="#3b82f6" name="Predicted" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Flagged Restaurants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flagged Restaurants ({filteredFlagged.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFlagged.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">No restaurants flagged</p>
                <p className="text-sm">All predictions are within normal thresholds</p>
              </div>
            ) : (
              filteredFlagged.map((prediction) => {
                const restaurant = restaurantMap.get(prediction.restaurantId);
                if (!restaurant) return null;
                
                const isSelected = selectedRestaurants.has(prediction.restaurantId);
                const potentialLoss = prediction.potentialRevenue - prediction.expectedRevenue;
                
                return (
                  <div
                    key={prediction.restaurantId}
                    className={`p-4 border rounded-lg transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRestaurantSelection(prediction.restaurantId)}
                        />
                        <div className="space-y-1">
                          <h4 className="font-medium text-gray-900">{restaurant.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{restaurant.zone}</span>
                            <span>•</span>
                            <span>{restaurant.contact}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getRiskBadge(prediction.riskLevel)}
                        {prediction.predictedOrders > orderThreshold[0] && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            High Volume
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Predicted Orders</p>
                        <p className="font-medium text-blue-600">{prediction.predictedOrders}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expected Revenue</p>
                        <p className="font-medium text-green-600">GHS {prediction.expectedRevenue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Potential Loss</p>
                        <p className="font-medium text-orange-600">GHS {potentialLoss}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cancellation Rate</p>
                        <p className="font-medium text-red-600">{(restaurant.cancellationRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
