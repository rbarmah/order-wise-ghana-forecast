
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Search, Filter } from "lucide-react";
import { PredictionData, Restaurant } from "@/utils/dummyData";

interface ValidationPanelProps {
  predictions: PredictionData[];
  restaurants: Restaurant[];
  onValidatedRestaurantsChange?: (validatedRestaurants: Set<string>) => void;
}

export function ValidationPanel({ 
  predictions, 
  restaurants, 
  onValidatedRestaurantsChange 
}: ValidationPanelProps) {
  const [orderVarianceThreshold, setOrderVarianceThreshold] = useState([10]);
  const [revenueVarianceThreshold, setRevenueVarianceThreshold] = useState([100]);
  const [validatedRestaurants, setValidatedRestaurants] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Create restaurant lookup
  const restaurantMap = new Map(restaurants.map(r => [r.id, r]));

  // Filter predictions that exceed thresholds (these are considered unusual)
  const unusualPredictions = predictions.filter(p => {
    const orderVar = Number(p.orderVariance) || 0;
    const revenueVar = Number(p.revenueVariance) || 0;
    return Math.abs(orderVar) > orderVarianceThreshold[0] || 
           Math.abs(revenueVar) > revenueVarianceThreshold[0];
  });

  // Normal predictions (within thresholds) should be automatically validated
  const normalPredictions = predictions.filter(p => {
    const orderVar = Number(p.orderVariance) || 0;
    const revenueVar = Number(p.revenueVariance) || 0;
    return Math.abs(orderVar) <= orderVarianceThreshold[0] && 
           Math.abs(revenueVar) <= revenueVarianceThreshold[0];
  });

  // Update validated restaurants whenever thresholds change
  useEffect(() => {
    const autoValidated = new Set(normalPredictions.map(p => p.restaurantId));
    setValidatedRestaurants(autoValidated);
    onValidatedRestaurantsChange?.(autoValidated);
  }, [orderVarianceThreshold[0], revenueVarianceThreshold[0]]);

  // Filter unusual predictions based on search
  const filteredUnusual = unusualPredictions.filter(p => {
    const restaurant = restaurantMap.get(p.restaurantId);
    if (!restaurant) return false;
    return restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           restaurant.zone.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleRestaurantValidation = (restaurantId: string) => {
    const newValidated = new Set(validatedRestaurants);
    if (newValidated.has(restaurantId)) {
      newValidated.delete(restaurantId);
    } else {
      newValidated.add(restaurantId);
    }
    setValidatedRestaurants(newValidated);
    onValidatedRestaurantsChange?.(newValidated);
  };

  const validateAll = () => {
    const allValidated = new Set([
      ...normalPredictions.map(p => p.restaurantId),
      ...filteredUnusual.map(p => p.restaurantId)
    ]);
    setValidatedRestaurants(allValidated);
    onValidatedRestaurantsChange?.(allValidated);
  };

  const validateOnlyNormal = () => {
    const onlyNormal = new Set(normalPredictions.map(p => p.restaurantId));
    setValidatedRestaurants(onlyNormal);
    onValidatedRestaurantsChange?.(onlyNormal);
  };

  const getVarianceBadge = (orderVariance: number, revenueVariance: number) => {
    const orderVar = Number(orderVariance) || 0;
    const revenueVar = Number(revenueVariance) || 0;
    
    const isOrderUnusual = Math.abs(orderVar) > orderVarianceThreshold[0];
    const isRevenueUnusual = Math.abs(revenueVar) > revenueVarianceThreshold[0];
    
    if (isOrderUnusual && isRevenueUnusual) {
      return <Badge variant="destructive">High Variance</Badge>;
    } else if (isOrderUnusual || isRevenueUnusual) {
      return <Badge variant="default">Medium Variance</Badge>;
    } else {
      return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ML Prediction Validation</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {unusualPredictions.length} Unusual
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {validatedRestaurants.size} Validated
          </Badge>
        </div>
      </div>

      {/* Threshold Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Variance Threshold Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Order Variance Threshold: ±{orderVarianceThreshold[0]} orders</Label>
              <Slider
                value={orderVarianceThreshold}
                onValueChange={setOrderVarianceThreshold}
                max={25}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Flag predictions with order variance beyond this threshold
              </p>
            </div>
            
            <div className="space-y-3">
              <Label>Revenue Variance Threshold: ±GHS {revenueVarianceThreshold[0]}</Label>
              <Slider
                value={revenueVarianceThreshold}
                onValueChange={setRevenueVarianceThreshold}
                max={300}
                min={10}
                step={10}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Flag predictions with revenue variance beyond this threshold
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Validation Logic:</strong> Predictions within thresholds are automatically validated for SMS deployment. 
              Unusual predictions (beyond thresholds) require manual validation to prevent sending questionable ML predictions to retailers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Unusual Predictions for Manual Validation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unusual Predictions Requiring Validation ({filteredUnusual.length})</CardTitle>
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
              <Button variant="outline" size="sm" onClick={validateAll}>
                Validate All
              </Button>
              <Button variant="outline" size="sm" onClick={validateOnlyNormal}>
                Only Normal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUnusual.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">No unusual predictions detected</p>
                <p className="text-sm">All ML predictions are within normal variance thresholds</p>
              </div>
            ) : (
              filteredUnusual.map((prediction) => {
                const restaurant = restaurantMap.get(prediction.restaurantId);
                if (!restaurant) return null;
                
                const isValidated = validatedRestaurants.has(prediction.restaurantId);
                const orderVar = Number(prediction.orderVariance) || 0;
                const revenueVar = Number(prediction.revenueVariance) || 0;
                
                return (
                  <div
                    key={prediction.restaurantId}
                    className={`p-4 border rounded-lg transition-all ${
                      isValidated ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isValidated}
                          onCheckedChange={() => toggleRestaurantValidation(prediction.restaurantId)}
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
                        {getVarianceBadge(orderVar, revenueVar)}
                        {!isValidated && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            Needs Review
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Historical Avg</p>
                        <p className="font-medium text-gray-700">{restaurant.avgDailyOrders} orders</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ML Prediction</p>
                        <p className="font-medium text-blue-600">{prediction.predictedOrders} orders</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Order Variance</p>
                        <p className={`font-medium ${orderVar >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {orderVar >= 0 ? '+' : ''}{orderVar}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue Variance</p>
                        <p className={`font-medium ${revenueVar >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {revenueVar >= 0 ? '+' : ''}GHS {revenueVar}
                        </p>
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
