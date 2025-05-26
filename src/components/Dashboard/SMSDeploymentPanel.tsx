
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Send, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { PredictionData, Restaurant } from "@/utils/dummyData";
import { useToast } from "@/hooks/use-toast";

interface SMSDeploymentPanelProps {
  predictions: PredictionData[];
  restaurants: Restaurant[];
  selectedRestaurants: Set<string>;
}

export function SMSDeploymentPanel({ predictions, restaurants, selectedRestaurants }: SMSDeploymentPanelProps) {
  const [smsTemplate, setSmsTemplate] = useState(
    "Hello, {restaurantName}! You lost GHS {lostRevenue} in sales yesterday. During your peak time around {peakHour}, your {cancelledOrders} orders were canceled due to {stockOutItems} being out of stock. We anticipate at least {predictedOrders} orders today. Please ensure you have enough stock to avoid cancellation and loss of money. Thank you for partnering with Hubtel."
  );
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'completed'>('idle');
  const [deliveryStatus, setDeliveryStatus] = useState<Map<string, 'pending' | 'sent' | 'delivered' | 'failed'>>(new Map());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const restaurantMap = new Map(restaurants.map(r => [r.id, r]));
  const predictionMap = new Map(predictions.map(p => [p.restaurantId, p]));

  const selectedRestaurantsList = Array.from(selectedRestaurants)
    .map(id => restaurantMap.get(id))
    .filter(Boolean) as Restaurant[];

  const generatePersonalizedSMS = (restaurant: Restaurant) => {
    const prediction = predictionMap.get(restaurant.id);
    if (!prediction) return '';

    const lostRevenue = (prediction.potentialRevenue - prediction.expectedRevenue).toFixed(0);
    const cancelledOrders = Math.floor(restaurant.avgDailyOrders * restaurant.cancellationRate);
    
    return smsTemplate
      .replace('{restaurantName}', restaurant.name)
      .replace('{lostRevenue}', lostRevenue)
      .replace('{peakHour}', `${restaurant.peakHour}:00`)
      .replace('{cancelledOrders}', cancelledOrders.toString())
      .replace('{stockOutItems}', restaurant.topItems.slice(0, 2).join(' and '))
      .replace('{predictedOrders}', prediction.predictedOrders.toString());
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
    selectedRestaurantsList.forEach(restaurant => {
      newDeliveryStatus.set(restaurant.id, 'pending');
    });
    setDeliveryStatus(new Map(newDeliveryStatus));

    // Simulate deployment process
    for (let i = 0; i < selectedRestaurantsList.length; i++) {
      const restaurant = selectedRestaurantsList[i];
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
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
    const failureCount = selectedRestaurantsList.length - successCount;
    
    toast({
      title: "SMS Deployment Complete",
      description: `${successCount} messages sent successfully, ${failureCount} failed.`,
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
        <h2 className="text-2xl font-bold text-gray-900">SMS Deployment</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {selectedRestaurantsList.length} Selected
          </Badge>
          {deploymentStatus === 'completed' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {deliveredCount}/{selectedRestaurantsList.length} Delivered
            </Badge>
          )}
        </div>
      </div>

      {/* SMS Template Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Template
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
              placeholder="Enter your SMS template with variables..."
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Available variables: {'{restaurantName}'}, {'{lostRevenue}'}, {'{peakHour}'}, {'{cancelledOrders}'}, {'{stockOutItems}'}, {'{predictedOrders}'}
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

      {/* Selected Restaurants for SMS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Selected Restaurants ({selectedRestaurantsList.length})</CardTitle>
            {selectedRestaurantsList.length > 0 && (
              <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!validateTemplate() || deploymentStatus === 'deploying'}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Deploy SMS ({selectedRestaurantsList.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm SMS Deployment</DialogTitle>
                    <DialogDescription>
                      You are about to send SMS messages to {selectedRestaurantsList.length} restaurants. 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <h4 className="font-medium mb-2">Message Preview:</h4>
                    <div className="bg-gray-50 p-3 rounded border text-sm">
                      {selectedRestaurantsList.length > 0 && generatePersonalizedSMS(selectedRestaurantsList[0])}
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
          {selectedRestaurantsList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No restaurants selected</p>
              <p className="text-sm">Select restaurants from the Validation Panel to send SMS alerts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deploymentStatus === 'deploying' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="font-medium text-blue-800">Deploying SMS messages...</span>
                  </div>
                  <Progress value={(sentCount + failedCount) / selectedRestaurantsList.length * 100} className="mt-2" />
                </div>
              )}
              
              {deploymentStatus === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">SMS Deployment Complete</span>
                  </div>
                  <div className="text-sm text-green-700">
                    {deliveredCount} delivered, {sentCount - deliveredCount} sent, {failedCount} failed
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {selectedRestaurantsList.map((restaurant) => {
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
                      
                      <Separator className="my-3" />
                      
                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wide">Message Preview</Label>
                        <p className="text-sm mt-1 bg-gray-50 p-2 rounded border">
                          {personalizedMessage}
                        </p>
                      </div>
                      
                      {prediction && (
                        <div className="mt-3 flex gap-4 text-xs text-gray-500">
                          <span>Predicted Orders: {prediction.predictedOrders}</span>
                          <span>Expected Revenue: GHS {prediction.expectedRevenue}</span>
                          <span>Risk Level: {prediction.riskLevel}</span>
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
