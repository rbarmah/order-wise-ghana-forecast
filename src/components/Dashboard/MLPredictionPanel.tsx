
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Target, DollarSign } from "lucide-react";
import { PredictionData, Restaurant } from "@/utils/dummyData";

interface MLPredictionPanelProps {
  predictions: PredictionData[];
  restaurants: Restaurant[];
}

export function MLPredictionPanel({ predictions, restaurants }: MLPredictionPanelProps) {
  // Calculate trend data for the last 7 days
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayPredictions = predictions.slice(i * 40, (i + 1) * 40); // Simulate daily predictions
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      orders: dayPredictions.reduce((sum, p) => sum + p.predictedOrders, 0),
      expectedRevenue: dayPredictions.reduce((sum, p) => sum + p.expectedRevenue, 0),
      potentialRevenue: dayPredictions.reduce((sum, p) => sum + p.potentialRevenue, 0),
      confidenceLower: dayPredictions.reduce((sum, p) => sum + p.confidenceInterval.lower, 0),
      confidenceUpper: dayPredictions.reduce((sum, p) => sum + p.confidenceInterval.upper, 0),
    };
  });

  const totalPredicted = predictions.reduce((sum, p) => sum + p.predictedOrders, 0);
  const totalExpected = predictions.reduce((sum, p) => sum + p.expectedRevenue, 0);
  const totalPotential = predictions.reduce((sum, p) => sum + p.potentialRevenue, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? 'GHS ' : ''}{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Volume Trends & Confidence Intervals</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="confidenceUpper"
                  stackId="1"
                  stroke="none"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="confidenceLower"
                  stackId="1"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="expectedRevenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Expected Revenue"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="potentialRevenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Potential Revenue"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
