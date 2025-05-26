
export interface Restaurant {
  id: string;
  name: string;
  zone: string;
  contact: string;
  location: string;
  avgDailyOrders: number;
  avgRevenue: number;
  cancellationRate: number;
  peakHour: number;
  topItems: string[];
  coordinates: [number, number];
}

export interface OrderData {
  restaurantId: string;
  date: string;
  hour: number;
  orders: number;
  revenue: number;
  cancellations: number;
  cancelledRevenue: number;
  stockOutItems: string[];
}

export interface PredictionData {
  restaurantId: string;
  date: string;
  predictedOrders: number;
  expectedRevenue: number;
  potentialRevenue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
}

const ghanaZones = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong Ahafo'
];

const restaurantTypes = [
  'Waakye Spot', 'Chop Bar', 'Barbeque Joint', 'Local Kitchen', 
  'Fast Food', 'Jollof House', 'Banku Bar', 'Rice & Stew', 
  'Kelewele Corner', 'Fried Rice Hub'
];

const ghanaFoods = [
  'Jollof Rice', 'Waakye', 'Banku & Tilapia', 'Kelewele', 'Fried Rice',
  'Red Red', 'Fufu & Light Soup', 'Kenkey', 'Tuo Zaafi', 'Palmnut Soup',
  'Groundnut Soup', 'Fried Plantain', 'Gari & Beans', 'Yam & Kontomire',
  'Chicken Light Soup', 'Beef Stew', 'Fish & Chips', 'Pepper Soup',
  'Bofrot', 'Meat Pie', 'Spring Rolls', 'Shawarma'
];

const ghanaLocations = [
  'Accra Central', 'Kumasi', 'Tema', 'Takoradi', 'Cape Coast',
  'Tamale', 'Ho', 'Sunyani', 'Koforidua', 'Bolgatanga',
  'Wa', 'Techiman', 'Nkawkaw', 'Obuasi', 'Dunkwa',
  'Winneba', 'Kasoa', 'Madina', 'Teshie', 'Ashaiman'
];

function generateRandomName(): string {
  const prefixes = ['Mama', 'Auntie', 'Uncle', 'Sister', 'Brother'];
  const names = ['Akosua', 'Kwame', 'Ama', 'Kofi', 'Efua', 'Yaw', 'Adwoa', 'Kwaku'];
  const suffixes = ['Kitchen', 'Spot', 'Place', 'Joint', 'Corner', 'House'];
  
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${names[Math.floor(Math.random() * names.length)]}'s ${restaurantTypes[Math.floor(Math.random() * restaurantTypes.length)]}`;
}

function generatePhoneNumber(): string {
  const prefixes = ['024', '054', '055', '026', '027'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `+233 ${prefix} ${suffix}`;
}

export function generateRestaurants(): Restaurant[] {
  const restaurants: Restaurant[] = [];
  
  for (let i = 0; i < 280; i++) {
    const lat = 4.5 + Math.random() * 6; // Ghana latitude range
    const lng = -3.5 + Math.random() * 4; // Ghana longitude range
    
    restaurants.push({
      id: `rest_${i + 1}`,
      name: generateRandomName(),
      zone: ghanaZones[Math.floor(Math.random() * ghanaZones.length)],
      contact: generatePhoneNumber(),
      location: ghanaLocations[Math.floor(Math.random() * ghanaLocations.length)],
      avgDailyOrders: Math.floor(Math.random() * 50) + 5,
      avgRevenue: Math.floor(Math.random() * 800) + 100,
      cancellationRate: Math.random() * 0.3,
      peakHour: Math.floor(Math.random() * 4) + 12, // 12-15 (lunch peak)
      topItems: ghanaFoods.sort(() => 0.5 - Math.random()).slice(0, 5),
      coordinates: [lng, lat]
    });
  }
  
  return restaurants;
}

export function generateHistoricalData(restaurants: Restaurant[], days: number = 30): OrderData[] {
  const data: OrderData[] = [];
  const today = new Date();
  
  for (let day = 0; day < days; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    restaurants.forEach(restaurant => {
      for (let hour = 6; hour < 22; hour++) {
        const isPeakHour = Math.abs(hour - restaurant.peakHour) <= 1;
        const baseOrders = isPeakHour ? restaurant.avgDailyOrders * 0.4 : restaurant.avgDailyOrders * 0.05;
        const orders = Math.floor(baseOrders + (Math.random() - 0.5) * baseOrders * 0.5);
        const avgOrderValue = restaurant.avgRevenue / restaurant.avgDailyOrders;
        const revenue = orders * avgOrderValue * (0.8 + Math.random() * 0.4);
        
        const cancellations = Math.floor(orders * restaurant.cancellationRate * Math.random());
        const cancelledRevenue = cancellations * avgOrderValue;
        
        const stockOutItems = cancellations > 0 ? 
          restaurant.topItems.slice(0, Math.floor(Math.random() * 3) + 1) : [];
        
        if (orders > 0) {
          data.push({
            restaurantId: restaurant.id,
            date: dateStr,
            hour,
            orders,
            revenue,
            cancellations,
            cancelledRevenue,
            stockOutItems
          });
        }
      }
    });
  }
  
  return data;
}

export function generatePredictions(restaurants: Restaurant[]): PredictionData[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  return restaurants.map(restaurant => {
    const variance = 0.15; // 15% variance
    const predicted = restaurant.avgDailyOrders * (0.9 + Math.random() * 0.2);
    const confidence = variance * predicted;
    
    const expectedRevenue = predicted * (restaurant.avgRevenue / restaurant.avgDailyOrders) * (1 - restaurant.cancellationRate);
    const potentialRevenue = predicted * (restaurant.avgRevenue / restaurant.avgDailyOrders);
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (restaurant.cancellationRate > 0.2) riskLevel = 'high';
    else if (restaurant.cancellationRate > 0.1) riskLevel = 'medium';
    
    return {
      restaurantId: restaurant.id,
      date: dateStr,
      predictedOrders: Math.round(predicted),
      expectedRevenue: Math.round(expectedRevenue),
      potentialRevenue: Math.round(potentialRevenue),
      confidenceInterval: {
        lower: Math.round(predicted - confidence),
        upper: Math.round(predicted + confidence)
      },
      riskLevel
    };
  });
}

export const restaurants = generateRestaurants();
export const historicalData = generateHistoricalData(restaurants);
export const predictions = generatePredictions(restaurants);
