
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Activity, Shield, MessageSquare } from "lucide-react";
import { MetricsOverview } from "@/components/Dashboard/MetricsOverview";
import { MLPredictionPanel } from "@/components/Dashboard/MLPredictionPanel";
import { ValidationPanel } from "@/components/Dashboard/ValidationPanel";
import { SMSDeploymentPanel } from "@/components/Dashboard/SMSDeploymentPanel";
import { ExportDialog } from "@/components/Dashboard/ExportDialog";
import { useRealTimeData } from "@/hooks/useRealTimeData";

const Index = () => {
  const { data, lastUpdated, isRefreshing, refreshData } = useRealTimeData();
  const [validatedRestaurants, setValidatedRestaurants] = useState<Set<string>>(new Set());

  const { restaurants, historicalData, predictions } = data;

  // Calculate overview metrics
  const totalPredictedOrders = predictions.reduce((sum, p) => sum + p.predictedOrders, 0);
  const totalExpectedRevenue = predictions.reduce((sum, p) => sum + p.expectedRevenue, 0);
  const totalPotentialRevenue = predictions.reduce((sum, p) => sum + p.potentialRevenue, 0);
  const highRiskCount = predictions.filter(p => p.riskLevel === 'high').length;

  const handleValidatedRestaurantsChange = (validated: Set<string>) => {
    setValidatedRestaurants(validated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ML Retailer Analytics</h1>
                <p className="text-sm text-gray-500">Real-time prediction validation & SMS deployment dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ExportDialog 
                predictions={predictions}
                restaurants={restaurants}
                historicalData={historicalData}
              />
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                280 Restaurants
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Metrics */}
        <MetricsOverview
          totalRestaurants={restaurants.length}
          totalPredictedOrders={totalPredictedOrders}
          totalExpectedRevenue={totalExpectedRevenue}
          totalPotentialRevenue={totalPotentialRevenue}
          highRiskCount={highRiskCount}
          lastUpdated={lastUpdated}
        />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 h-12">
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              ML Predictions
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS Deployment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            <MLPredictionPanel predictions={predictions} restaurants={restaurants} />
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <ValidationPanel 
              predictions={predictions} 
              restaurants={restaurants}
              onValidatedRestaurantsChange={handleValidatedRestaurantsChange}
            />
          </TabsContent>

          <TabsContent value="sms" className="space-y-6">
            <SMSDeploymentPanel
              predictions={predictions}
              restaurants={restaurants}
              validatedRestaurants={validatedRestaurants}
            />
          </TabsContent>
        </Tabs>

        {/* Success Metrics Footer */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">ML System Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">94.7%</div>
                <div className="text-sm text-blue-700">ML Prediction Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">98.7%</div>
                <div className="text-sm text-green-700">SMS Delivery Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">82.1%</div>
                <div className="text-sm text-purple-700">Retailer Response Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">28.3%</div>
                <div className="text-sm text-orange-700">Revenue Recovery</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
