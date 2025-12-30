import { create } from 'zustand';
import type { TabId, CommodityData, SupplierData, EconomicIndicator, WeatherData, NewsArticle } from '../types';
import { mockCommodities, mockSuppliers, mockEconomicIndicators, mockWeather, mockNews } from '../utils/mockData';
import { fetchAllNews } from '../services/newsService';
import { fetchWeatherData } from '../services/weatherService';
import { fetchCommodityData } from '../services/commodityService';
import { fetchSupplierData } from '../services/supplierService';
import { fetchEconomicData } from '../services/economicService';

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
  isLoadingWeather: boolean;
  isLoadingCommodities: boolean;
  isLoadingSuppliers: boolean;
  isLoadingEconomic: boolean;
  lastUpdated: string | null;
  error: string | null;

  // Actions
  setActiveTab: (tab: TabId) => void;
  fetchData: () => Promise<void>;
  fetchNews: () => Promise<void>;
  fetchWeather: () => Promise<void>;
  fetchCommodities: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  fetchEconomic: () => Promise<void>;
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
  isLoadingWeather: false,
  isLoadingCommodities: false,
  isLoadingSuppliers: false,
  isLoadingEconomic: false,
  lastUpdated: null,
  error: null,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay for mock data
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Load mock data as fallback (will be replaced by real data)
      set({
        commodities: mockCommodities,
        suppliers: mockSuppliers,
        economicIndicators: mockEconomicIndicators,
        weather: mockWeather,
        news: mockNews,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
        error: null
      });

      // Fetch real data in the background for all data types
      get().fetchCommodities();
      get().fetchSuppliers();
      get().fetchEconomic();
      get().fetchNews();
      get().fetchWeather();
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

  fetchWeather: async () => {
    set({ isLoadingWeather: true });

    try {
      const realWeather = await fetchWeatherData();

      if (realWeather.length > 0) {
        set({
          weather: realWeather,
          isLoadingWeather: false
        });
        console.log(`Loaded real weather data for ${realWeather.length} locations from Open-Meteo`);
      } else {
        // Keep mock weather if fetch failed
        console.log('Using mock weather data (Open-Meteo unavailable)');
        set({ isLoadingWeather: false });
      }
    } catch (error) {
      console.error('Error fetching real weather:', error);
      set({ isLoadingWeather: false });
      // Keep mock weather on error
    }
  },

  fetchCommodities: async () => {
    set({ isLoadingCommodities: true });

    try {
      const realCommodities = await fetchCommodityData();

      if (realCommodities.length > 0 && realCommodities.some(c => c.currentPrice > 0)) {
        set({
          commodities: realCommodities,
          isLoadingCommodities: false,
          lastUpdated: new Date().toISOString()
        });
        console.log(`Loaded real commodity data for ${realCommodities.length} commodities from Yahoo Finance`);
      } else {
        // Keep mock commodities if fetch failed
        console.log('Using mock commodity data (Yahoo Finance unavailable)');
        set({ isLoadingCommodities: false });
      }
    } catch (error) {
      console.error('Error fetching real commodities:', error);
      set({ isLoadingCommodities: false });
      // Keep mock commodities on error
    }
  },

  fetchSuppliers: async () => {
    set({ isLoadingSuppliers: true });

    try {
      const realSuppliers = await fetchSupplierData();

      if (realSuppliers.length > 0 && realSuppliers.some(s => s.marketCap !== 'N/A')) {
        set({
          suppliers: realSuppliers,
          isLoadingSuppliers: false,
          lastUpdated: new Date().toISOString()
        });
        console.log(`Loaded real supplier data for ${realSuppliers.length} suppliers from Yahoo Finance`);
      } else {
        console.log('Using mock supplier data (Yahoo Finance unavailable)');
        set({ isLoadingSuppliers: false });
      }
    } catch (error) {
      console.error('Error fetching real suppliers:', error);
      set({ isLoadingSuppliers: false });
    }
  },

  fetchEconomic: async () => {
    set({ isLoadingEconomic: true });

    try {
      const realEconomic = await fetchEconomicData();

      if (realEconomic.length > 0) {
        set({
          economicIndicators: realEconomic,
          isLoadingEconomic: false,
          lastUpdated: new Date().toISOString()
        });
        console.log(`Loaded real economic data for ${realEconomic.length} indicators`);
      } else {
        console.log('Using mock economic data (APIs unavailable)');
        set({ isLoadingEconomic: false });
      }
    } catch (error) {
      console.error('Error fetching real economic data:', error);
      set({ isLoadingEconomic: false });
    }
  },

  refreshData: async () => {
    set({ isLoading: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      set({
        isLoading: false,
        lastUpdated: new Date().toISOString()
      });

      // Refresh all real data sources
      get().fetchCommodities();
      get().fetchSuppliers();
      get().fetchEconomic();
      get().fetchNews();
      get().fetchWeather();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data'
      });
    }
  }
}));
