
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
  orderVariance: number; // prediction - historical average
  revenueVariance: number; // prediction - historical average
}

const ghanaZones = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong Ahafo'
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

// Real retailer names from the provided data
const realRetailerNames = [
  'Tasty Queen', 'KFC', 'Pizzaman Chickenman', 'Papaye Fast Food', 'ADB Gob3',
  'Atta Barima', 'Pice Restaurant', 'Obaa Gifty Waakye', 'Barbeque City',
  'Mango Down Waakye', 'Hajia Sauda Restaurant', 'Waakye Abrantie', 'MJ\'s Cuisine',
  'Betty\'s Kitchen', 'Haatso Waakye (Hajia Rahi)', 'Fatawu Bicycle, Nyohani Round About',
  'Harry\'s Kitchen', 'Abura GRA Gobe', 'Adiza Waakye Special', 'KFC Kasoa',
  'Starbites', 'KFC Haatso', 'Tasty Chef', 'KFC Dome', 'Capital View Hotel',
  'KFC Adenta', 'Ayewamu By Jane', 'Vapiano Foods', 'Alhaji\'s Wife Waakye',
  'KFC Dansoman', 'KFC Osu', 'Eno Special', 'Jays Cafe', 'God Is Love Chopbar',
  'KFC Sakumono', 'KFC Weija', 'Kinis Kitchen', 'Pipe Ano Insha Allah Waakye',
  'Blue Lagoon Junction Waakye (Aj & Rams)', 'Queens Hall Gob3', 'Nuamah\'s Kitchen',
  'KFC Ashaiman', 'Adom Joy Fast Foods', 'Papa\'s Pizza', 'Lets Eat Good',
  'KFC Melcom', 'Mayday Shawarma & Bites', 'Akua Poly', 'KFC Tema',
  'IceMan Pub & Restaurant', 'LawBest Cuisine', 'Sister Afia Angwamo',
  'Shapii Shawarma', 'Berny Joy | Daavi', 'KFC Kwashieman', 'Hajia Saida Waakye',
  'KFC EL Boundary', 'Frank Test Restaurant', 'Central Market Gobe',
  'Kubekrom Restaurant Test', 'Maranatha Fast Foods', 'Sweet Bite Foods',
  'Kate Corner', 'Rahko School Joint', 'Dont Mind Your Wife', 'Maa Afia\'s Pork Cafe',
  'Santa Rose Restaurant', 'Chef Rudy\'s Kitchen', 'KFC - Bekwai', 'KFC Kwabenya',
  'KFC Ablekuma', 'Hoxton Food Court (Apatakesi)', 'KFC Kubekrom', 'Bels Kitchen',
  'Hanch Community 4', 'Cookhaus', 'KFC Takoradi', 'Jollof King',
  'Taste and See - Test', 'Roliz Pizza', 'Keren\'s Test Restaurant', 'DVLA Waakye',
  'Chapel Hill Beans', 'Kofan', 'Express Food Joint | GRA Waakye', 'Marwako Fast Food',
  'Deep Dish Waakye', 'Sweet Mummy\'s Yummy', 'Home Made Special', 'Ataa Maame',
  'Vodafone Waakye', 'De Stir Catering Services', 'Bread Boutique', '808 Bistro',
  'Sek Tasty Bite & Ganis Pizza', 'Adani Waakye', 'Latifa Waakye', 'Gobe Gucci',
  'Sweet Mother Waakye', 'X5 Plus', 'Bar Naas', 'Nogora Junction  Indomie & Food Bay',
  'Ayisha Food Joint (Aisha)', 'Mr. Robert Fries', 'Adenta Kenkey House',
  'Muni Diehuo', 'Daavi\'s Special Gobe', 'Bar Naas Pizza', 'Circle Spot Tuo Zaafi',
  'Maa Regi\'s Restaurant', 'Ginnette Foods', 'Linda Dor Restaurant',
  'A.D Motors Jollof (Makafui\'s Inn)', 'Bode Gob3', 'Efie Nkwan Specials',
  'Asew Pa Ye Restaurant', 'Bantama Market Gob3', 'The Joint Cafe | Summerlight',
  'Mr. Awal\'s Waakye', 'The Dish', 'Lizz Kitchen', 'Queens Hall Gobe',
  'Odo Rice | Feel Free Restaurant', 'Mr Brown\'s Kitchen', 'Ceci\'s Eating Place',
  'KFC Circle', 'Shawarma King', 'KFC 37 Liberation', 'Original Alhassan Indomie',
  'Chez Lee', 'Prison\'s Canteen Waakye', 'KFC EL Lagos Avenue', 'Macmon Special Foods',
  'Estate Kitchen', 'Fatawu Bicycle', 'Nana\'s Kitchen', 'Special Waakye Boutique',
  'Seaman Kenkey', 'James Fast Food', 'Adams Kitchen', 'Melcom - Baatsona',
  'Barima Waakye Special Joint', 'Rockz Waakye', 'Aunte Suzzie\'s Indomie',
  'Pizza Hut', 'Bar Naas Shawarma', 'Becca Beans', 'KFC EL Hills', 'Koko Porks',
  'F n J Kitchen', 'De Shallot Eatery | Nhyoni Roundabout', 'Abena Special',
  'Asew Special Koko', 'KFC KNUST', 'Super-Mc Restaurant', '10 Minutes Kitchen',
  'Insha Allah Food Joint', 'Waakye Teq', 'Achekke Chez Vivian', 'Shawarma Boiz',
  'Degree Catering Services', 'Mama Lad Special Rice', 'Adford Pub & Restaurant',
  'Juli Beans (Aunty Monica-18 Junction Beans)', 'KFC Bekwai', 'Daavi Special Gobe',
  'KFC Cape Coast', 'Laud K Pharmacy', 'Nuamah\'s Cafe', 'Aduane Restaurant - Test',
  'PhiloBite Noodles', 'Amina\'s Tuo Zaafi', 'KFC Koforidua', 'Akos Special Angwamoo',
  'Derbi\'s Special Noodles', 'Jos Bakery', 'Ben\'s Pizza', 'Emma Locals',
  'The Joint Cafe', 'Broni\'s Kitchen', 'Dreamers Kenkey Restaurant', 'Doree Catering',
  'Topzy Foods', 'Rahko Kenkey', 'Makeeda Kitchen', 'Zack\'s Big Bite Fast Food & Restaurant',
  'Asantewaa Chop Bar', 'Focus Street Kitchen', 'My Hot Chicken', 'Aboude Fast Food',
  'Ruhdan Catering', 'Kobjoe Pharmacy', 'Joe De Jonny Restaurant', 'Downtown Canteen',
  '5:30 Special Foods', 'Efie ne Fie Aduane', 'Takyiwa\'s Kitchen', 'Daavi Ama Chop Bar',
  'KFC Dodowa Road', 'Melcom Plus - Kaneshie', 'Nite Fast Food', 'Street Bites',
  'Ibiza Foods', 'Lebene Kitchen (Pigfarm)', 'Chop Better Fast Food', 'Lovecare Foods',
  'Dzigbordi Home Cooking', 'Holy Mary Fast Food', 'Mbrodzem Chop Bar', 'Nite Nite',
  'Papaye Fast Food - Awudome', 'Ruby\'s Spicy', 'Adiz Special Food', 'Sunkwa Fast Food',
  'Hannah\'s Special Foods (Ecobank Traffic Beans)', 'Melcom - Boundary Road',
  'Ampesi Boutique & Local Foods Hub', 'Lynda\'s Delight', 'Pizza Inn',
  'John Barnes Beans |Gobe City', 'Daavi\'s Special Beans (Gobɛ)', 'Kersting\'s Pizza \'N\' More',
  'GNAT Restaurant', 'Gadef Restaurant', 'Adiza Waakye Special (Hadizah Baatsonaa Total)',
  'Awurade Kasa Kenkey Joint', 'Columbia Waakye', 'Dine With Sarry', 'Sweet Apple Beans',
  'Aba Yaa Special', 'Becky Gob3', 'Linswrap Catering Services', 'OJ\'s Kitchen',
  'Auntie Mary Special Indomie', 'Lokors Tuo Zaafi', 'Mpeabo Nkoaa (Boys Boys Fast Food)',
  'KFC Manet Junction', 'Luke City', 'Bubbles Pub And Grill', 'Del-Trish Food Haven',
  'HJ Indomie & Spaghetti Special', 'Junction Mall', 'Micky Lan\'s Kitchen',
  'Derricks Indomie', 'Mini Gobe Gate', 'Daavi Gobe', 'Super - Mc Restaurant',
  'Fausty\'s Pub'
];

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
      name: realRetailerNames[i] || `Restaurant ${i + 1}`,
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
    const variance = 0.25; // 25% variance to create more interesting predictions
    const predicted = restaurant.avgDailyOrders * (0.7 + Math.random() * 0.6); // More variation
    const confidence = variance * predicted;
    
    const expectedRevenue = predicted * (restaurant.avgRevenue / restaurant.avgDailyOrders) * (1 - restaurant.cancellationRate);
    const potentialRevenue = predicted * (restaurant.avgRevenue / restaurant.avgDailyOrders);
    
    // Calculate variances
    const orderVariance = predicted - restaurant.avgDailyOrders;
    const revenueVariance = expectedRevenue - restaurant.avgRevenue;
    
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
      riskLevel,
      orderVariance: Math.round(orderVariance),
      revenueVariance: Math.round(revenueVariance)
    };
  });
}

export const restaurants = generateRestaurants();
export const historicalData = generateHistoricalData(restaurants);
export const predictions = generatePredictions(restaurants);
