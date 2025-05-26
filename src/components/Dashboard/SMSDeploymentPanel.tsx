
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Send, CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { PredictionData, Restaurant } from "@/utils/dummyData";
import { useToast } from "@/hooks/use-toast";

interface SMSDeploymentPanelProps {
  predictions: PredictionData[];
  restaurants: Restaurant[];
  validatedRestaurants: Set<string>;
}

export function SMSDeploymentPanel({ 
  predictions, 
  restaurants, 
  validatedRestaurants 
}: SMSDeploymentPanelProps) {
  const [smsTemplate, setSmsTemplate] = useState(
    "Hello {restaurantName}! Our AI predicts {predictedOrders} orders for today ({variance} vs your avg). {trendMessage} {recommendationMessage} Your estimated revenue: GHS {expectedRevenue}. Prepare accordingly to maximize sales. - Hubtel ML Analytics"
  );
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'completed'>('idle');
  const [deliveryStatus, setDeliveryStatus] = useState<Map<string, 'pending' | 'sent' | 'delivered' | 'failed'>>(new Map());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const restaurantMap = new Map(restaurants.map(r => [r.id, r]));
  const predictionMap = new Map(predictions.map(p => [p.restaurantId, p]));

  // Only show validated restaurants for SMS deployment
  const eligibleRestaurants = Array.from(validatedRestaurants)
    .map(id => restaurantMap.get(id))
    .filter(Boolean) as Restaurant[];

  const generatePersonalizedSMS = (restaurant: Restaurant) => {
    const prediction = predictionMap.get(restaurant.id);
    if (!prediction) return '';

    const variance = prediction.orderVariance;
    const isIncrease = variance >= 0;
    
    const trendMessage = isIncrease 
      ? `This is ${Math.abs(variance)} orders more than usual.`
      : `This is ${Math.abs(variance)} orders less than usual.`;
    
    const recommendationMessage = isIncrease
      ? "Stock up on your popular items to handle the increased demand!"
      : "Consider promoting special offers to boost orders.";
    
    return smsTemplate
      .replace('{restaurantName}', restaurant.name)
      .replace('{predictedOrders}', prediction.predictedOrders.toString())
      .replace('{variance}', `${variance >= 0 ? '+' : ''}${variance}`)
      .replace('{trendMessage}', trendMessage)
      .replace('{recommendationMessage}', recommendationMessage)
      .replace('{expectedRevenue}', prediction.expectedRevenue.toString());
  };

  const validateTemplate = () => {
    const requiredVariables = ['{restaurantName}', '{predictedOrders}'];
    const missingVariables = requiredVariables.filter(variable => !smsTemplate.includes(variable));
    return missingVariables.length === 0;
  };

  const deployMessages = async () => {
    setDeploymentStatus('deploying');
    setIsConfirmOpen(false);
    
    const newDeliveryStatus = new Map();
    
    // Initialize all as pending
    eligibleRestaurants.forEach(restaurant => {
      newDeliveryStatus.set(restaurant.id, 'pending');
    });
    setDeliveryStatus(new Map(newDeliveryStatus));

    // Simulate deployment process
    for (let i = 0; i < eligibleRestaurants.length; i++) {
      const restaurant = eligibleRestaurants[i];
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate success/failure (95% success rate for validated predictions)
      const success = Math.random() > 0.05;
      newDeliveryStatus.set(restaurant.id, success ? 'sent' : 'failed');
      setDeliveryStatus(new Map(newDeliveryStatus));
      
      // Simulate delivery confirmation after sending
      if (success) {
        setTimeout(() => {
          newDeliveryStatus.set(restaurant.id, 'delivered');
          setDeliveryStatus(new Map(newDeliveryStatus));
        }, 2000 + Math.random() * 3000);
      }
    }

    setDeploymentStatus('completed');
    
    const successCount = Array.from(newDeliveryStatus.values()).filter(status => status === 'sent' || status === 'delivered').length;
    const failureCount = eligibleRestaurants.length - successCount;
    
    toast({
      title: "ML Prediction SMS Deployment Complete",
      description: `${successCount} validated predictions sent successfully, ${failureCount} failed.`,
      duration: 5000,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const sentCount = Array.from(deliveryStatus.values()).filter(status => status === 'sent' || status === 'delivered').length;
  const deliveredCount = Array.from(deliveryStatus.values()).filter(status => status === 'delivered').length;
  const failedCount = Array.from(deliveryStatus.values()).filter(status => status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ML Prediction SMS Deployment</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {eligibleRestaurants.length} Validated
          </Badge>
          {deploymentStatus === 'completed' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {deliveredCount}/{eligibleRestaurants.length} Delivered
            </Badge>
          )}
        </div>
      </div>

      {/* SMS Template Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            ML Prediction SMS Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Message Template</Label>
            <Textarea
              id="template"
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              rows={4}
              className="mt-2"
              placeholder="Enter your ML prediction SMS template with variables..."
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Available variables: {'{restaurantName}'}, {'{predictedOrders}'}, {'{variance}'}, {'{trendMessage}'}, {'{recommendationMessage}'}, {'{expectedRevenue}'}
            </div>
            {validateTemplate() ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Valid Template
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Invalid Template
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validated Restaurants for SMS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Validated ML Predictions for SMS ({eligibleRestaurants.length})</CardTitle>
            {eligibleRestaurants.length > 0 && (
              <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!validateTemplate() || deploymentStatus === 'deploying'}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Deploy SMS ({eligibleRestaurants.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm ML Prediction SMS Deployment</DialogTitle>
                    <DialogDescription>
                      You are about to send ML prediction-based SMS messages to {eligibleRestaurants.length} validated restaurants. 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <h4 className="font-medium mb-2">Message Preview:</h4>
                    <div className="bg-gray-50 p-3 rounded border text-sm">
                      {eligibleRestaurants.length > 0 && generatePersonalizedSMS(eligibleRestaurants[0])}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={deployMessages} className="bg-green-600 hover:bg-green-700">
                      Confirm & Send
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {eligibleRestaurants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No validated predictions for SMS</p>
              <p className="text-sm">Validate ML predictions in the Validation Panel to enable SMS deployment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deploymentStatus === 'deploying' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="font-medium text-blue-800">Deploying ML prediction SMS messages...</span>
                  </div>
                  <Progress value={(sentCount + failedCount) / eligibleRestaurants.length * 100} className="mt-2" />
                </div>
              )}
              
              {deploymentStatus === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">ML Prediction SMS Deployment Complete</span>
                  </div>
                  <div className="text-sm text-green-700">
                    {deliveredCount} delivered, {sentCount - deliveredCount} sent, {failedCount} failed
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {eligibleRestaurants.map((restaurant) => {
                  const prediction = predictionMap.get(restaurant.id);
                  const personalizedMessage = generatePersonalizedSMS(restaurant);
                  const status = deliveryStatus.get(restaurant.id);
                  
                  return (
                    <div key={restaurant.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{restaurant.name}</h4>
                          <p className="text-sm text-gray-600">{restaurant.contact}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {status && getStatusIcon(status)}
                          {status && getStatusBadge(status)}
                        </div>
                      </div>
                      
                      {prediction && (
                        <div className="mb-3 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            {prediction.orderVariance >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={prediction.orderVariance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {prediction.orderVariance >= 0 ? '+' : ''}{prediction.orderVariance} orders
                            </span>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            ML Validated
                          </Badge>
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      
                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wide">ML Prediction Message</Label>
                        <p className="text-sm mt-1 bg-gray-50 p-2 rounded border">
                          {personalizedMessage}
                        </p>
                      </div>
                      
                      {prediction && (
                        <div className="mt-3 flex gap-4 text-xs text-gray-500">
                          <span>Predicted: {prediction.predictedOrders} orders</span>
                          <span>Historical: {restaurant.avgDailyOrders} orders</span>
                          <span>Expected Revenue: GHS {prediction.expectedRevenue}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
