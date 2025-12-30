export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  published_at: string;
}

export interface CommodityData {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  monthlyChangePercent: number;
  quarterlyChangePercent: number;
  volatility: number;
  volume: number | null;
  priceImpact: string;
  socalImpact: string;
  trendDirection: 'up' | 'down' | 'neutral';
  riskLevel: RiskLevel;
  news: NewsArticle[];
  lastUpdated: string;
  historicalPrices: { date: string; price: number }[];
}

export interface SupplierData {
  id: string;
  ticker: string;
  company: string;
  focusArea: string;
  socalPresence: string;
  keyProducts: string;
  marketCap: string;
  grossMargin: number | null;
  operatingMargin: number | null;
  profitMargin: number | null;
  revenueGrowth: number | null;
  roe: number | null;
  peRatio: number | null;
  debtEquity: number | null;
  weeklyPerformance: number;
  monthlyPerformance: number;
  quarterlyPerformance: number;
  pricingPowerAssessment: string;
  financialHealth: string;
  socalRelevanceScore: number;
  investmentGrade: string;
  news: NewsArticle[];
  lastUpdated: string;
  historicalPrices: { date: string; price: number }[];
}

export interface EconomicIndicator {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  unit: string;
  description: string;
  source: string;
  lastUpdated: string;
  historicalData: { date: string; value: number }[];
}

export interface DailyForecast {
  date: string;
  dayName: string;
  high: number;
  low: number;
  condition: string;
  precipitationProbability: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  humidity: number | null;
  precipitationProbability: number | null;
  time: string;
  condition: string;
  icon: string;
  forecast?: DailyForecast[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export type TabId = 'commodities' | 'suppliers' | 'economic' | 'news' | 'weather';

export interface DashboardState {
  activeTab: TabId;
  commodities: CommodityData[];
  suppliers: SupplierData[];
  economicIndicators: EconomicIndicator[];
  weather: WeatherData[];
  news: NewsArticle[];
  isLoading: boolean;
  lastUpdated: string | null;
  error: string | null;
}
