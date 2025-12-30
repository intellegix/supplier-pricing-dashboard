import { create } from 'zustand';
import type { TabId, CommodityData, SupplierData, EconomicIndicator, WeatherData, NewsArticle } from '../types';
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
      // Fetch all real data in parallel
      const [commodities, suppliers, economic, news, weather] = await Promise.all([
        fetchCommodityData(),
        fetchSupplierData(),
        fetchEconomicData(),
        fetchAllNews(),
        fetchWeatherData(),
      ]);

      set({
        commodities,
        suppliers,
        economicIndicators: economic,
        news,
        weather,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
        error: null
      });

      console.log('All real data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      });
    }
  },

  fetchNews: async () => {
    set({ isLoadingNews: true });

    try {
      const news = await fetchAllNews();
      set({
        news,
        isLoadingNews: false
      });
      console.log(`Loaded ${news.length} news articles from Yahoo Finance`);
    } catch (error) {
      console.error('Error fetching news:', error);
      set({ isLoadingNews: false });
    }
  },

  fetchWeather: async () => {
    set({ isLoadingWeather: true });

    try {
      const weather = await fetchWeatherData();
      set({
        weather,
        isLoadingWeather: false
      });
      console.log(`Loaded weather data for ${weather.length} locations from Open-Meteo`);
    } catch (error) {
      console.error('Error fetching weather:', error);
      set({ isLoadingWeather: false });
    }
  },

  fetchCommodities: async () => {
    set({ isLoadingCommodities: true });

    try {
      const commodities = await fetchCommodityData();
      set({
        commodities,
        isLoadingCommodities: false,
        lastUpdated: new Date().toISOString()
      });
      console.log(`Loaded commodity data for ${commodities.length} commodities from Yahoo Finance`);
    } catch (error) {
      console.error('Error fetching commodities:', error);
      set({ isLoadingCommodities: false });
    }
  },

  fetchSuppliers: async () => {
    set({ isLoadingSuppliers: true });

    try {
      const suppliers = await fetchSupplierData();
      set({
        suppliers,
        isLoadingSuppliers: false,
        lastUpdated: new Date().toISOString()
      });
      console.log(`Loaded supplier data for ${suppliers.length} suppliers from Yahoo Finance`);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      set({ isLoadingSuppliers: false });
    }
  },

  fetchEconomic: async () => {
    set({ isLoadingEconomic: true });

    try {
      const economicIndicators = await fetchEconomicData();
      set({
        economicIndicators,
        isLoadingEconomic: false,
        lastUpdated: new Date().toISOString()
      });
      console.log(`Loaded economic data for ${economicIndicators.length} indicators`);
    } catch (error) {
      console.error('Error fetching economic data:', error);
      set({ isLoadingEconomic: false });
    }
  },

  refreshData: async () => {
    set({ isLoading: true });

    try {
      // Refresh all data sources in parallel
      const [commodities, suppliers, economic, news, weather] = await Promise.all([
        fetchCommodityData(),
        fetchSupplierData(),
        fetchEconomicData(),
        fetchAllNews(),
        fetchWeatherData(),
      ]);

      set({
        commodities,
        suppliers,
        economicIndicators: economic,
        news,
        weather,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      });

      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data'
      });
    }
  }
}));
