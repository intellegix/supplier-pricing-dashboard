import type { CommodityData, SupplierData, EconomicIndicator, WeatherData, NewsArticle } from '../types';

// Generate historical price data
const generateHistoricalPrices = (basePrice: number, days: number = 90, volatility: number = 0.02) => {
  const prices: { date: string; price: number }[] = [];
  let currentPrice = basePrice * (1 - volatility * days * 0.3);

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * volatility * currentPrice;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.5);
    prices.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2))
    });
  }

  return prices;
};

export const mockCommodities: CommodityData[] = [
  {
    id: 'lumber',
    name: 'Lumber',
    symbol: 'LBR=F',
    currentPrice: 542.30,
    dailyChange: 8.50,
    dailyChangePercent: 1.59,
    monthlyChangePercent: -3.2,
    quarterlyChangePercent: 12.5,
    volatility: 28.4,
    volume: 1250000,
    priceImpact: 'HIGH',
    socalImpact: 'Direct impact on framing costs for residential construction',
    trendDirection: 'up',
    riskLevel: 'MODERATE',
    news: [
      { title: 'Lumber futures rise on housing demand', url: 'https://www.google.com/search?q=lumber+futures+prices+news&tbm=nws', source: 'Reuters', published_at: '2025-12-29' },
      { title: 'Canadian mill closures affect supply', url: 'https://www.google.com/search?q=lumber+supply+canada+mills+news&tbm=nws', source: 'Bloomberg', published_at: '2025-12-28' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(542.30, 90, 0.025)
  },
  {
    id: 'steel',
    name: 'Steel',
    symbol: 'SLX',
    currentPrice: 67.85,
    dailyChange: -0.42,
    dailyChangePercent: -0.62,
    monthlyChangePercent: 2.1,
    quarterlyChangePercent: -5.8,
    volatility: 18.2,
    volume: 3450000,
    priceImpact: 'HIGH',
    socalImpact: 'Critical for commercial and infrastructure projects',
    trendDirection: 'down',
    riskLevel: 'LOW',
    news: [
      { title: 'Steel prices stabilize amid China demand', url: 'https://www.google.com/search?q=steel+prices+china+news&tbm=nws', source: 'MarketWatch', published_at: '2025-12-29' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(67.85, 90, 0.018)
  },
  {
    id: 'copper',
    name: 'Copper',
    symbol: 'HG=F',
    currentPrice: 4.28,
    dailyChange: 0.05,
    dailyChangePercent: 1.18,
    monthlyChangePercent: 4.5,
    quarterlyChangePercent: 8.2,
    volatility: 22.1,
    volume: 8920000,
    priceImpact: 'MODERATE',
    socalImpact: 'Affects electrical and plumbing material costs',
    trendDirection: 'up',
    riskLevel: 'MODERATE',
    news: [
      { title: 'Copper rallies on EV demand outlook', url: 'https://www.google.com/search?q=copper+prices+EV+demand+news&tbm=nws', source: 'CNBC', published_at: '2025-12-29' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(4.28, 90, 0.022)
  },
  {
    id: 'oil',
    name: 'Crude Oil',
    symbol: 'CL=F',
    currentPrice: 72.45,
    dailyChange: -1.23,
    dailyChangePercent: -1.67,
    monthlyChangePercent: -8.3,
    quarterlyChangePercent: -12.1,
    volatility: 32.5,
    volume: 15600000,
    priceImpact: 'HIGH',
    socalImpact: 'Transportation and equipment operation costs',
    trendDirection: 'down',
    riskLevel: 'HIGH',
    news: [
      { title: 'Oil drops on demand concerns', url: 'https://www.google.com/search?q=crude+oil+prices+news&tbm=nws', source: 'Reuters', published_at: '2025-12-29' },
      { title: 'OPEC+ considers production cuts', url: 'https://www.google.com/search?q=OPEC+production+cuts+news&tbm=nws', source: 'Bloomberg', published_at: '2025-12-28' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(72.45, 90, 0.032)
  },
  {
    id: 'natgas',
    name: 'Natural Gas',
    symbol: 'NG=F',
    currentPrice: 3.42,
    dailyChange: 0.15,
    dailyChangePercent: 4.59,
    monthlyChangePercent: 18.2,
    quarterlyChangePercent: 45.3,
    volatility: 48.7,
    volume: 12300000,
    priceImpact: 'MODERATE',
    socalImpact: 'Energy costs for manufacturing and heating',
    trendDirection: 'up',
    riskLevel: 'CRITICAL',
    news: [
      { title: 'Natural gas spikes on winter demand', url: 'https://www.google.com/search?q=natural+gas+prices+winter+demand+news&tbm=nws', source: 'MarketWatch', published_at: '2025-12-29' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(3.42, 90, 0.048)
  },
  {
    id: 'usd',
    name: 'USD Index',
    symbol: 'DX-Y.NYB',
    currentPrice: 104.25,
    dailyChange: 0.32,
    dailyChangePercent: 0.31,
    monthlyChangePercent: 1.8,
    quarterlyChangePercent: 3.2,
    volatility: 8.4,
    volume: null,
    priceImpact: 'MODERATE',
    socalImpact: 'Affects import costs for materials',
    trendDirection: 'up',
    riskLevel: 'LOW',
    news: [
      { title: 'Dollar strengthens on Fed outlook', url: 'https://www.google.com/search?q=US+dollar+index+fed+news&tbm=nws', source: 'Reuters', published_at: '2025-12-29' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(104.25, 90, 0.008)
  },
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'GC=F',
    currentPrice: 2048.50,
    dailyChange: 12.30,
    dailyChangePercent: 0.60,
    monthlyChangePercent: 2.4,
    quarterlyChangePercent: 8.9,
    volatility: 14.2,
    volume: 5670000,
    priceImpact: 'LOW',
    socalImpact: 'Safe haven indicator for market conditions',
    trendDirection: 'up',
    riskLevel: 'LOW',
    news: [
      { title: 'Gold holds gains on geopolitical risks', url: 'https://www.google.com/search?q=gold+prices+geopolitical+news&tbm=nws', source: 'Bloomberg', published_at: '2025-12-29' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(2048.50, 90, 0.014)
  },
  {
    id: 'silver',
    name: 'Silver',
    symbol: 'SI=F',
    currentPrice: 24.18,
    dailyChange: 0.28,
    dailyChangePercent: 1.17,
    monthlyChangePercent: 5.2,
    quarterlyChangePercent: 12.8,
    volatility: 26.3,
    volume: 4230000,
    priceImpact: 'LOW',
    socalImpact: 'Industrial applications in solar panels',
    trendDirection: 'up',
    riskLevel: 'MODERATE',
    news: [
      { title: 'Silver rises on industrial demand', url: 'https://www.google.com/search?q=silver+prices+industrial+demand+news&tbm=nws', source: 'CNBC', published_at: '2025-12-29' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(24.18, 90, 0.026)
  }
];

export const mockSuppliers: SupplierData[] = [
  {
    id: 'hd',
    ticker: 'HD',
    company: 'Home Depot',
    focusArea: 'Home Improvement Retail',
    socalPresence: 'STRONG',
    keyProducts: 'Building Materials, Tools, Lumber, Plumbing',
    marketCap: '$372.5B',
    grossMargin: 33.5,
    operatingMargin: 15.2,
    profitMargin: 10.8,
    revenueGrowth: 4.2,
    roe: 45.8,
    peRatio: 24.3,
    debtEquity: 1.42,
    weeklyPerformance: 2.1,
    monthlyPerformance: 5.3,
    quarterlyPerformance: 8.7,
    pricingPowerAssessment: 'STRONG',
    financialHealth: 'EXCELLENT',
    socalRelevanceScore: 95,
    investmentGrade: 'A',
    news: [
      { title: 'Home Depot reports strong Q4 outlook', url: 'https://www.google.com/search?q=Home+Depot+HD+stock+news&tbm=nws', source: 'CNBC', published_at: '2025-12-29' }
    ],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(385.20, 90, 0.015)
  },
  {
    id: 'low',
    ticker: 'LOW',
    company: "Lowe's Companies",
    focusArea: 'Home Improvement Retail',
    socalPresence: 'STRONG',
    keyProducts: 'Building Materials, Appliances, Tools',
    marketCap: '$142.8B',
    grossMargin: 33.2,
    operatingMargin: 12.8,
    profitMargin: 8.5,
    revenueGrowth: 2.8,
    roe: 38.2,
    peRatio: 18.5,
    debtEquity: 2.15,
    weeklyPerformance: 1.5,
    monthlyPerformance: 3.8,
    quarterlyPerformance: 6.2,
    pricingPowerAssessment: 'MODERATE',
    financialHealth: 'GOOD',
    socalRelevanceScore: 90,
    investmentGrade: 'A-',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(248.50, 90, 0.018)
  },
  {
    id: 'bldr',
    ticker: 'BLDR',
    company: 'Builders FirstSource',
    focusArea: 'Building Products Manufacturing',
    socalPresence: 'MODERATE',
    keyProducts: 'Structural Components, Millwork, Windows',
    marketCap: '$22.4B',
    grossMargin: 32.8,
    operatingMargin: 18.5,
    profitMargin: 12.2,
    revenueGrowth: -5.2,
    roe: 52.3,
    peRatio: 12.8,
    debtEquity: 0.85,
    weeklyPerformance: -1.2,
    monthlyPerformance: 4.5,
    quarterlyPerformance: -2.3,
    pricingPowerAssessment: 'STRONG',
    financialHealth: 'GOOD',
    socalRelevanceScore: 75,
    investmentGrade: 'B+',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(178.30, 90, 0.025)
  },
  {
    id: 'fast',
    ticker: 'FAST',
    company: 'Fastenal',
    focusArea: 'Industrial Distribution',
    socalPresence: 'MODERATE',
    keyProducts: 'Fasteners, Safety Products, Tools',
    marketCap: '$42.1B',
    grossMargin: 45.2,
    operatingMargin: 21.3,
    profitMargin: 15.8,
    revenueGrowth: 5.8,
    roe: 32.5,
    peRatio: 36.2,
    debtEquity: 0.18,
    weeklyPerformance: 0.8,
    monthlyPerformance: 2.1,
    quarterlyPerformance: 4.5,
    pricingPowerAssessment: 'STRONG',
    financialHealth: 'EXCELLENT',
    socalRelevanceScore: 70,
    investmentGrade: 'A',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(72.40, 90, 0.012)
  },
  {
    id: 'mas',
    ticker: 'MAS',
    company: 'Masco Corporation',
    focusArea: 'Building Products',
    socalPresence: 'MODERATE',
    keyProducts: 'Faucets, Cabinets, Paints',
    marketCap: '$18.2B',
    grossMargin: 35.8,
    operatingMargin: 17.2,
    profitMargin: 11.5,
    revenueGrowth: 1.2,
    roe: 42.1,
    peRatio: 16.8,
    debtEquity: 1.82,
    weeklyPerformance: -0.5,
    monthlyPerformance: 1.8,
    quarterlyPerformance: 3.2,
    pricingPowerAssessment: 'MODERATE',
    financialHealth: 'GOOD',
    socalRelevanceScore: 65,
    investmentGrade: 'B+',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(78.50, 90, 0.016)
  },
  {
    id: 'carr',
    ticker: 'CARR',
    company: 'Carrier Global',
    focusArea: 'HVAC & Refrigeration',
    socalPresence: 'STRONG',
    keyProducts: 'HVAC Systems, Refrigeration, Fire & Security',
    marketCap: '$58.3B',
    grossMargin: 28.5,
    operatingMargin: 14.8,
    profitMargin: 9.2,
    revenueGrowth: 8.5,
    roe: 28.3,
    peRatio: 28.5,
    debtEquity: 1.25,
    weeklyPerformance: 1.2,
    monthlyPerformance: 4.2,
    quarterlyPerformance: 12.5,
    pricingPowerAssessment: 'STRONG',
    financialHealth: 'GOOD',
    socalRelevanceScore: 85,
    investmentGrade: 'A-',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(62.80, 90, 0.018)
  },
  {
    id: 'jci',
    ticker: 'JCI',
    company: 'Johnson Controls',
    focusArea: 'Building Technologies',
    socalPresence: 'STRONG',
    keyProducts: 'Building Automation, HVAC, Security',
    marketCap: '$48.2B',
    grossMargin: 32.1,
    operatingMargin: 11.5,
    profitMargin: 6.8,
    revenueGrowth: 3.2,
    roe: 12.5,
    peRatio: 22.3,
    debtEquity: 0.52,
    weeklyPerformance: 0.3,
    monthlyPerformance: 2.8,
    quarterlyPerformance: 5.8,
    pricingPowerAssessment: 'MODERATE',
    financialHealth: 'GOOD',
    socalRelevanceScore: 80,
    investmentGrade: 'B+',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(72.30, 90, 0.015)
  },
  {
    id: 'oc',
    ticker: 'OC',
    company: 'Owens Corning',
    focusArea: 'Building Materials',
    socalPresence: 'MODERATE',
    keyProducts: 'Insulation, Roofing, Composites',
    marketCap: '$14.8B',
    grossMargin: 28.2,
    operatingMargin: 16.5,
    profitMargin: 10.8,
    revenueGrowth: -2.5,
    roe: 22.8,
    peRatio: 11.2,
    debtEquity: 0.68,
    weeklyPerformance: -0.8,
    monthlyPerformance: 1.5,
    quarterlyPerformance: -1.8,
    pricingPowerAssessment: 'MODERATE',
    financialHealth: 'GOOD',
    socalRelevanceScore: 72,
    investmentGrade: 'B',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(168.40, 90, 0.02)
  },
  {
    id: 'shw',
    ticker: 'SHW',
    company: 'Sherwin-Williams',
    focusArea: 'Paints & Coatings',
    socalPresence: 'STRONG',
    keyProducts: 'Architectural Paints, Industrial Coatings',
    marketCap: '$82.5B',
    grossMargin: 42.5,
    operatingMargin: 15.8,
    profitMargin: 10.2,
    revenueGrowth: 2.8,
    roe: 68.5,
    peRatio: 32.5,
    debtEquity: 2.85,
    weeklyPerformance: 0.5,
    monthlyPerformance: 3.2,
    quarterlyPerformance: 7.5,
    pricingPowerAssessment: 'STRONG',
    financialHealth: 'GOOD',
    socalRelevanceScore: 88,
    investmentGrade: 'A-',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(325.60, 90, 0.012)
  },
  {
    id: 'vmc',
    ticker: 'VMC',
    company: 'Vulcan Materials',
    focusArea: 'Construction Aggregates',
    socalPresence: 'STRONG',
    keyProducts: 'Crushed Stone, Sand, Gravel, Asphalt',
    marketCap: '$35.2B',
    grossMargin: 28.8,
    operatingMargin: 18.2,
    profitMargin: 12.5,
    revenueGrowth: 6.8,
    roe: 15.2,
    peRatio: 38.5,
    debtEquity: 0.58,
    weeklyPerformance: 1.8,
    monthlyPerformance: 5.5,
    quarterlyPerformance: 9.8,
    pricingPowerAssessment: 'STRONG',
    financialHealth: 'EXCELLENT',
    socalRelevanceScore: 92,
    investmentGrade: 'A',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(265.80, 90, 0.014)
  },
  {
    id: 'mlm',
    ticker: 'MLM',
    company: 'Martin Marietta',
    focusArea: 'Construction Aggregates',
    socalPresence: 'MODERATE',
    keyProducts: 'Aggregates, Heavy Materials, Cement',
    marketCap: '$32.8B',
    grossMargin: 26.5,
    operatingMargin: 19.8,
    profitMargin: 13.2,
    revenueGrowth: 8.2,
    roe: 14.8,
    peRatio: 35.2,
    debtEquity: 0.62,
    weeklyPerformance: 2.2,
    monthlyPerformance: 6.8,
    quarterlyPerformance: 11.5,
    pricingPowerAssessment: 'STRONG',
    financialHealth: 'EXCELLENT',
    socalRelevanceScore: 78,
    investmentGrade: 'A',
    news: [],
    lastUpdated: new Date().toISOString(),
    historicalPrices: generateHistoricalPrices(542.30, 90, 0.016)
  }
];

export const mockEconomicIndicators: EconomicIndicator[] = [
  {
    id: 'fed-rate',
    name: 'Federal Funds Rate',
    value: 5.25,
    previousValue: 5.25,
    change: 0,
    changePercent: 0,
    unit: '%',
    description: 'Target federal funds rate set by the Federal Reserve',
    source: 'Federal Reserve',
    lastUpdated: new Date().toISOString(),
    historicalData: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, 11 - i, 1).toISOString().split('T')[0],
      value: 5.25 + (i > 6 ? -0.25 : 0)
    })).reverse()
  },
  {
    id: 'unemployment',
    name: 'Unemployment Rate',
    value: 3.7,
    previousValue: 3.8,
    change: -0.1,
    changePercent: -2.63,
    unit: '%',
    description: 'National unemployment rate',
    source: 'Bureau of Labor Statistics',
    lastUpdated: new Date().toISOString(),
    historicalData: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, 11 - i, 1).toISOString().split('T')[0],
      value: 3.7 + Math.random() * 0.3
    })).reverse()
  },
  {
    id: 'cpi',
    name: 'Consumer Price Index',
    value: 3.2,
    previousValue: 3.4,
    change: -0.2,
    changePercent: -5.88,
    unit: '%',
    description: 'Year-over-year inflation rate',
    source: 'Bureau of Labor Statistics',
    lastUpdated: new Date().toISOString(),
    historicalData: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, 11 - i, 1).toISOString().split('T')[0],
      value: 3.2 + Math.random() * 0.8
    })).reverse()
  },
  {
    id: 'housing-starts',
    name: 'Housing Starts',
    value: 1.42,
    previousValue: 1.38,
    change: 0.04,
    changePercent: 2.90,
    unit: 'M',
    description: 'Annualized housing starts in millions',
    source: 'Census Bureau',
    lastUpdated: new Date().toISOString(),
    historicalData: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, 11 - i, 1).toISOString().split('T')[0],
      value: 1.42 + (Math.random() - 0.5) * 0.2
    })).reverse()
  },
  {
    id: 'building-permits',
    name: 'Building Permits',
    value: 1.52,
    previousValue: 1.48,
    change: 0.04,
    changePercent: 2.70,
    unit: 'M',
    description: 'Annualized building permits in millions',
    source: 'Census Bureau',
    lastUpdated: new Date().toISOString(),
    historicalData: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, 11 - i, 1).toISOString().split('T')[0],
      value: 1.52 + (Math.random() - 0.5) * 0.15
    })).reverse()
  },
  {
    id: 'ppi-construction',
    name: 'PPI Construction',
    value: 2.8,
    previousValue: 3.1,
    change: -0.3,
    changePercent: -9.68,
    unit: '%',
    description: 'Producer Price Index for construction materials',
    source: 'Bureau of Labor Statistics',
    lastUpdated: new Date().toISOString(),
    historicalData: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, 11 - i, 1).toISOString().split('T')[0],
      value: 2.8 + Math.random() * 1.5
    })).reverse()
  }
];

// Generate 7-day forecast data
const generateForecast = (baseTemp: number) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const conditions = ['Sunny', 'Partly Cloudy', 'Clear', 'Cloudy'];
  const forecast = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const variation = Math.floor(Math.random() * 10) - 5;
    forecast.push({
      date: date.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : days[date.getDay()],
      high: baseTemp + variation + 5,
      low: baseTemp + variation - 8,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      precipitationProbability: Math.floor(Math.random() * 30)
    });
  }
  return forecast;
};

export const mockWeather: WeatherData[] = [
  {
    location: 'San Diego',
    temperature: 68,
    windSpeed: 8,
    weatherCode: 1,
    humidity: 65,
    precipitationProbability: 5,
    time: new Date().toISOString(),
    condition: 'Partly Cloudy',
    icon: 'partly-cloudy',
    forecast: generateForecast(68)
  },
  {
    location: 'Ventura',
    temperature: 64,
    windSpeed: 10,
    weatherCode: 1,
    humidity: 68,
    precipitationProbability: 15,
    time: new Date().toISOString(),
    condition: 'Partly Cloudy',
    icon: 'partly-cloudy',
    forecast: generateForecast(64)
  },
  {
    location: 'El Cajon',
    temperature: 74,
    windSpeed: 6,
    weatherCode: 0,
    humidity: 50,
    precipitationProbability: 0,
    time: new Date().toISOString(),
    condition: 'Sunny',
    icon: 'sunny',
    forecast: generateForecast(74)
  },
  {
    location: 'Chula Vista',
    temperature: 66,
    windSpeed: 12,
    weatherCode: 2,
    humidity: 70,
    precipitationProbability: 10,
    time: new Date().toISOString(),
    condition: 'Cloudy',
    icon: 'cloudy',
    forecast: generateForecast(66)
  },
  {
    location: 'Santee',
    temperature: 72,
    windSpeed: 5,
    weatherCode: 0,
    humidity: 55,
    precipitationProbability: 0,
    time: new Date().toISOString(),
    condition: 'Clear',
    icon: 'clear',
    forecast: generateForecast(72)
  }
];

export const mockNews: NewsArticle[] = [
  {
    title: 'Southern California Construction Market Shows Strong Growth in Q4 2025',
    url: 'https://www.google.com/search?q=southern+california+construction+market+news&tbm=nws',
    source: 'Construction Dive',
    published_at: '2025-12-29T10:30:00Z'
  },
  {
    title: 'Lumber Prices Expected to Stabilize in Early 2026',
    url: 'https://www.google.com/search?q=lumber+prices+2026+forecast+news&tbm=nws',
    source: 'Bloomberg',
    published_at: '2025-12-29T09:15:00Z'
  },
  {
    title: 'Home Depot Expands Pro Services in San Diego Region',
    url: 'https://www.google.com/search?q=Home+Depot+pro+services+expansion+news&tbm=nws',
    source: 'Reuters',
    published_at: '2025-12-28T16:45:00Z'
  },
  {
    title: 'Federal Reserve Signals Steady Rates Through Q1 2026',
    url: 'https://www.google.com/search?q=federal+reserve+interest+rates+news&tbm=nws',
    source: 'CNBC',
    published_at: '2025-12-28T14:20:00Z'
  },
  {
    title: 'Steel Tariff Concerns Rise Amid Trade Negotiations',
    url: 'https://www.google.com/search?q=steel+tariffs+trade+news&tbm=nws',
    source: 'MarketWatch',
    published_at: '2025-12-28T11:00:00Z'
  },
  {
    title: 'California Building Permits Up 8% Year-Over-Year',
    url: 'https://www.google.com/search?q=california+building+permits+news&tbm=nws',
    source: 'LA Times',
    published_at: '2025-12-27T15:30:00Z'
  },
  {
    title: 'Infrastructure Bill to Boost SoCal Aggregate Demand',
    url: 'https://www.google.com/search?q=infrastructure+bill+construction+materials+news&tbm=nws',
    source: 'Engineering News-Record',
    published_at: '2025-12-27T10:00:00Z'
  },
  {
    title: 'Copper Demand Surge Expected from EV Infrastructure Projects',
    url: 'https://www.google.com/search?q=copper+demand+EV+infrastructure+news&tbm=nws',
    source: 'Mining Weekly',
    published_at: '2025-12-26T12:00:00Z'
  }
];
