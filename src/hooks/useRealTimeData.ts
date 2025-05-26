
import { useState, useEffect, useCallback } from 'react';
import { restaurants, historicalData, predictions, generatePredictions } from '@/utils/dummyData';

export function useRealTimeData() {
  const [currentData, setCurrentData] = useState({
    restaurants,
    historicalData,
    predictions
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate new predictions with slight variations
    const newPredictions = generatePredictions(restaurants);
    
    setCurrentData(prev => ({
      ...prev,
      predictions: newPredictions
    }));
    
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    data: currentData,
    lastUpdated,
    isRefreshing,
    refreshData
  };
}
