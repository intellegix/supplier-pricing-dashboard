import { create } from 'zustand';
import type { TabId, CommodityData, SupplierData, EconomicIndicator, WeatherData, NewsArticle } from '../types';
import { mockCommodities, mockSuppliers, mockEconomicIndicators, mockWeather, mockNews } from '../utils/mockData';
import { fetchAllNews } from '../services/newsService';

interface DashboardStore {
  // State
  activeTab: TabId;
  commodities: CommodityData[];
  suppliers: SupplierData[];
  economicIndicators: EconomicIndicator[];
  weather: WeatherData[];
  news: NewsArticle[];
  isLoading: boolean;
  isLoadingNews: boolean;
  lastUpdated: string | null;
  error: string | null;

  // Actions
  setActiveTab: (tab: TabId) => void;
  fetchData: () => Promise<void>;
  fetchNews: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  activeTab: 'commodities',
  commodities: [],
  suppliers: [],
  economicIndicators: [],
  weather: [],
  news: [],
  isLoading: true,
  isLoadingNews: false,
  lastUpdated: null,
  error: null,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay for mock data
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Load mock data for commodities, suppliers, etc.
      set({
        commodities: mockCommodities,
        suppliers: mockSuppliers,
        economicIndicators: mockEconomicIndicators,
        weather: mockWeather,
        news: mockNews, // Start with mock news as fallback
        isLoading: false,
        lastUpdated: new Date().toISOString(),
        error: null
      });

      // Fetch real news in the background
      get().fetchNews();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      });
    }
  },

  fetchNews: async () => {
    set({ isLoadingNews: true });

    try {
      const realNews = await fetchAllNews();

      if (realNews.length > 0) {
        set({
          news: realNews,
          isLoadingNews: false
        });
        console.log(`Loaded ${realNews.length} real news articles from Yahoo Finance`);
      } else {
        // Keep mock news if no real news fetched
        console.log('Using mock news data (Yahoo Finance unavailable)');
        set({ isLoadingNews: false });
      }
    } catch (error) {
      console.error('Error fetching real news:', error);
      set({ isLoadingNews: false });
      // Keep mock news on error
    }
  },

  refreshData: async () => {
    set({ isLoading: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Slightly randomize some values to simulate live data
      const updatedCommodities = mockCommodities.map((c) => ({
        ...c,
        currentPrice: c.currentPrice * (1 + (Math.random() - 0.5) * 0.01),
        dailyChange: c.dailyChange + (Math.random() - 0.5) * 0.5,
        lastUpdated: new Date().toISOString()
      }));

      set({
        commodities: updatedCommodities,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      });

      // Also refresh news
      get().fetchNews();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data'
      });
    }
  }
}));
