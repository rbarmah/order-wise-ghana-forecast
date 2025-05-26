
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileText, Table, BarChart } from "lucide-react";
import { PredictionData, Restaurant, OrderData } from "@/utils/dummyData";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  predictions: PredictionData[];
  restaurants: Restaurant[];
  historicalData: OrderData[];
}

export function ExportDialog({ predictions, restaurants, historicalData }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedData, setSelectedData] = useState({
    predictions: true,
    restaurants: true,
    historical: false,
    flagged: false
  });
  const { toast } = useToast();

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const generateJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    let exportedFiles = 0;

    if (selectedData.predictions) {
      const predictionData = predictions.map(p => {
        const restaurant = restaurants.find(r => r.id === p.restaurantId);
        return {
          restaurant_name: restaurant?.name || 'Unknown',
          zone: restaurant?.zone || '',
          predicted_orders: p.predictedOrders,
          expected_revenue: p.expectedRevenue,
          potential_revenue: p.potentialRevenue,
          confidence_lower: p.confidenceInterval.lower,
          confidence_upper: p.confidenceInterval.upper,
          risk_level: p.riskLevel,
          date: p.date
        };
      });

      if (exportFormat === 'csv') {
        generateCSV(predictionData, `predictions_${timestamp}`);
      } else {
        generateJSON(predictionData, `predictions_${timestamp}`);
      }
      exportedFiles++;
    }

    if (selectedData.restaurants) {
      const restaurantData = restaurants.map(r => ({
        id: r.id,
        name: r.name,
        zone: r.zone,
        contact: r.contact,
        location: r.location,
        avg_daily_orders: r.avgDailyOrders,
        avg_revenue: r.avgRevenue,
        cancellation_rate: r.cancellationRate,
        peak_hour: r.peakHour,
        top_items: r.topItems.join('; ')
      }));

      if (exportFormat === 'csv') {
        generateCSV(restaurantData, `restaurants_${timestamp}`);
      } else {
        generateJSON(restaurantData, `restaurants_${timestamp}`);
      }
      exportedFiles++;
    }

    if (selectedData.historical) {
      const historicalExport = historicalData.slice(0, 1000).map(h => ({
        restaurant_id: h.restaurantId,
        date: h.date,
        hour: h.hour,
        orders: h.orders,
        revenue: h.revenue,
        cancellations: h.cancellations,
        cancelled_revenue: h.cancelledRevenue,
        stock_out_items: h.stockOutItems.join('; ')
      }));

      if (exportFormat === 'csv') {
        generateCSV(historicalExport, `historical_data_${timestamp}`);
      } else {
        generateJSON(historicalExport, `historical_data_${timestamp}`);
      }
      exportedFiles++;
    }

    if (selectedData.flagged) {
      const flaggedData = predictions.filter(p => p.riskLevel === 'high').map(p => {
        const restaurant = restaurants.find(r => r.id === p.restaurantId);
        return {
          restaurant_name: restaurant?.name || 'Unknown',
          zone: restaurant?.zone || '',
          contact: restaurant?.contact || '',
          predicted_orders: p.predictedOrders,
          expected_revenue: p.expectedRevenue,
          potential_loss: p.potentialRevenue - p.expectedRevenue,
          risk_level: p.riskLevel,
          cancellation_rate: restaurant?.cancellationRate || 0
        };
      });

      if (exportFormat === 'csv') {
        generateCSV(flaggedData, `flagged_restaurants_${timestamp}`);
      } else {
        generateJSON(flaggedData, `flagged_restaurants_${timestamp}`);
      }
      exportedFiles++;
    }

    toast({
      title: "Export Complete",
      description: `${exportedFiles} file(s) downloaded successfully`,
      duration: 3000,
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Dashboard Data</DialogTitle>
          <DialogDescription>
            Select the data you want to export and choose your preferred format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Data Selection */}
          <div>
            <Label className="text-base font-medium">Data to Export</Label>
            <div className="space-y-3 mt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="predictions"
                  checked={selectedData.predictions}
                  onCheckedChange={(checked) => 
                    setSelectedData(prev => ({ ...prev, predictions: !!checked }))
                  }
                />
                <Label htmlFor="predictions" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  ML Predictions ({predictions.length} records)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="restaurants"
                  checked={selectedData.restaurants}
                  onCheckedChange={(checked) => 
                    setSelectedData(prev => ({ ...prev, restaurants: !!checked }))
                  }
                />
                <Label htmlFor="restaurants" className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Restaurant Details ({restaurants.length} records)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="historical"
                  checked={selectedData.historical}
                  onCheckedChange={(checked) => 
                    setSelectedData(prev => ({ ...prev, historical: !!checked }))
                  }
                />
                <Label htmlFor="historical" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Historical Data (last 1000 records)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flagged"
                  checked={selectedData.flagged}
                  onCheckedChange={(checked) => 
                    setSelectedData(prev => ({ ...prev, flagged: !!checked }))
                  }
                />
                <Label htmlFor="flagged" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Flagged Restaurants Only
                </Label>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <Label className="text-base font-medium">Export Format</Label>
            <RadioGroup 
              value={exportFormat} 
              onValueChange={setExportFormat}
              className="mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV (Comma Separated Values)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON (JavaScript Object Notation)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              className="flex-1"
              disabled={!Object.values(selectedData).some(Boolean)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
