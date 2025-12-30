import { create } from 'zustand';
import type { TabId, CommodityData, SupplierData, EconomicIndicator, WeatherData, NewsArticle } from '../types';
import { fetchAllNews } from '../services/newsService';
import { fetchWeatherData } from '../services/weatherService';
import { fetchCommodityData } from '../services/commodityService';
import { fetchSupplierData } from '../services/supplierService';
import { fetchEconomicData } from '../services/economicService';

// Cache keys
const CACHE_KEYS = {
  commodities: 'spi_cache_commodities',
  suppliers: 'spi_cache_suppliers',
  economic: 'spi_cache_economic',
  news: 'spi_cache_news',
  weather: 'spi_cache_weather',
  lastUpdated: 'spi_cache_lastUpdated',
};

// Helper functions for localStorage caching
function saveToCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to cache:', e);
  }
}

function loadFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (e) {
    console.warn('Failed to load from cache:', e);
  }
  return null;
}

interface DashboardStore {
  // State
  activeTab: TabId;
  commodities: CommodityData[];
  suppliers: SupplierData[];
  economicIndicators: EconomicIndicator[];
  weather: WeatherData[];
  news: NewsArticle[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingNews: boolean;
  isLoadingWeather: boolean;
  isLoadingCommodities: boolean;
  isLoadingSuppliers: boolean;
  isLoadingEconomic: boolean;
  lastUpdated: string | null;
  error: string | null;

  // Actions
  setActiveTab: (tab: TabId) => void;
  loadCachedData: () => boolean;
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
  isRefreshing: false,
  isLoadingNews: false,
  isLoadingWeather: false,
  isLoadingCommodities: false,
  isLoadingSuppliers: false,
  isLoadingEconomic: false,
  lastUpdated: null,
  error: null,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Load cached data immediately (returns true if cache was found)
  loadCachedData: () => {
    const commodities = loadFromCache<CommodityData[]>(CACHE_KEYS.commodities);
    const suppliers = loadFromCache<SupplierData[]>(CACHE_KEYS.suppliers);
    const economic = loadFromCache<EconomicIndicator[]>(CACHE_KEYS.economic);
    const news = loadFromCache<NewsArticle[]>(CACHE_KEYS.news);
    const weather = loadFromCache<WeatherData[]>(CACHE_KEYS.weather);
    const lastUpdated = loadFromCache<string>(CACHE_KEYS.lastUpdated);

    const hasCache = !!(commodities?.length || suppliers?.length || economic?.length);

    if (hasCache) {
      set({
        commodities: commodities || [],
        suppliers: suppliers || [],
        economicIndicators: economic || [],
        news: news || [],
        weather: weather || [],
        lastUpdated,
        isLoading: false,
      });
      console.log('Loaded cached data from localStorage');
    }

    return hasCache;
  },

  fetchData: async () => {
    const state = get();

    // If we have cached data, show refreshing indicator instead of full loading
    const hasData = state.commodities.length > 0 || state.suppliers.length > 0;

    if (hasData) {
      set({
        isRefreshing: true,
        isLoadingWeather: true,
        isLoadingCommodities: true,
        isLoadingEconomic: true,
        isLoadingNews: true,
        isLoadingSuppliers: true,
        error: null
      });
    } else {
      set({
        isLoading: true,
        isLoadingWeather: true,
        isLoadingCommodities: true,
        isLoadingEconomic: true,
        isLoadingNews: true,
        isLoadingSuppliers: true,
        error: null
      });
    }

    // PROGRESSIVE LOADING: Each service updates UI immediately when it completes
    // This dramatically improves perceived performance - users see data in 1-4 seconds
    // instead of waiting 30+ seconds for all services

    // Track completion for final refresh state
    let completedCount = 0;
    const totalServices = 5;

    const updateCompletion = () => {
      completedCount++;
      if (completedCount === totalServices) {
        set({ isRefreshing: false });
        console.log('All data loaded progressively');
      }
    };

    // Weather - Fastest (~1 second) - No CORS proxy needed
    fetchWeatherData()
      .then((weather) => {
        saveToCache(CACHE_KEYS.weather, weather);
        set({
          weather,
          isLoadingWeather: false,
          isLoading: false, // Remove loading overlay as soon as first data arrives
        });
        console.log(`Weather loaded: ${weather.length} locations`);
      })
      .catch((error) => console.error('Weather fetch error:', error))
      .finally(updateCompletion);

    // Commodities - Fast (~4 seconds)
    fetchCommodityData()
      .then((commodities) => {
        const lastUpdated = new Date().toISOString();
        saveToCache(CACHE_KEYS.commodities, commodities);
        saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
        set({
          commodities,
          isLoadingCommodities: false,
          isLoading: false,
          lastUpdated,
        });
        console.log(`Commodities loaded: ${commodities.length} items`);
      })
      .catch((error) => console.error('Commodities fetch error:', error))
      .finally(updateCompletion);

    // Economic Indicators - Medium (~4 seconds)
    fetchEconomicData()
      .then((economic) => {
        const lastUpdated = new Date().toISOString();
        saveToCache(CACHE_KEYS.economic, economic);
        saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
        set({
          economicIndicators: economic,
          isLoadingEconomic: false,
          isLoading: false,
          lastUpdated,
        });
        console.log(`Economic indicators loaded: ${economic.length} items`);
      })
      .catch((error) => console.error('Economic fetch error:', error))
      .finally(updateCompletion);

    // News - Medium (~5 seconds)
    fetchAllNews()
      .then((news) => {
        saveToCache(CACHE_KEYS.news, news);
        set({
          news,
          isLoadingNews: false,
          isLoading: false,
        });
        console.log(`News loaded: ${news.length} articles`);
      })
      .catch((error) => console.error('News fetch error:', error))
      .finally(updateCompletion);

    // Suppliers - Slowest (~30 seconds due to rate limiting)
    fetchSupplierData()
      .then((suppliers) => {
        const lastUpdated = new Date().toISOString();
        saveToCache(CACHE_KEYS.suppliers, suppliers);
        saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
        set({
          suppliers,
          isLoadingSuppliers: false,
          isLoading: false,
          lastUpdated,
        });
        console.log(`Suppliers loaded: ${suppliers.length} items`);
      })
      .catch((error) => console.error('Suppliers fetch error:', error))
      .finally(updateCompletion);
  },

  fetchNews: async () => {
    set({ isLoadingNews: true });

    try {
      const news = await fetchAllNews();
      saveToCache(CACHE_KEYS.news, news);
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
      saveToCache(CACHE_KEYS.weather, weather);
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
      const lastUpdated = new Date().toISOString();
      saveToCache(CACHE_KEYS.commodities, commodities);
      saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
      set({
        commodities,
        isLoadingCommodities: false,
        lastUpdated
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
      const lastUpdated = new Date().toISOString();
      saveToCache(CACHE_KEYS.suppliers, suppliers);
      saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
      set({
        suppliers,
        isLoadingSuppliers: false,
        lastUpdated
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
      const lastUpdated = new Date().toISOString();
      saveToCache(CACHE_KEYS.economic, economicIndicators);
      saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
      set({
        economicIndicators,
        isLoadingEconomic: false,
        lastUpdated
      });
      console.log(`Loaded economic data for ${economicIndicators.length} indicators`);
    } catch (error) {
      console.error('Error fetching economic data:', error);
      set({ isLoadingEconomic: false });
    }
  },

  refreshData: async () => {
    // Set all individual loading states
    set({
      isRefreshing: true,
      isLoadingWeather: true,
      isLoadingCommodities: true,
      isLoadingEconomic: true,
      isLoadingNews: true,
      isLoadingSuppliers: true,
    });

    // PROGRESSIVE REFRESH: Each service updates UI immediately when it completes
    let completedCount = 0;
    const totalServices = 5;

    const updateCompletion = () => {
      completedCount++;
      if (completedCount === totalServices) {
        set({ isRefreshing: false });
        console.log('All data refreshed progressively');
      }
    };

    // Weather - Fastest
    fetchWeatherData()
      .then((weather) => {
        saveToCache(CACHE_KEYS.weather, weather);
        set({ weather, isLoadingWeather: false });
        console.log(`Weather refreshed: ${weather.length} locations`);
      })
      .catch((error) => {
        console.error('Weather refresh error:', error);
        set({ isLoadingWeather: false });
      })
      .finally(updateCompletion);

    // Commodities
    fetchCommodityData()
      .then((commodities) => {
        const lastUpdated = new Date().toISOString();
        saveToCache(CACHE_KEYS.commodities, commodities);
        saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
        set({ commodities, isLoadingCommodities: false, lastUpdated });
        console.log(`Commodities refreshed: ${commodities.length} items`);
      })
      .catch((error) => {
        console.error('Commodities refresh error:', error);
        set({ isLoadingCommodities: false });
      })
      .finally(updateCompletion);

    // Economic Indicators
    fetchEconomicData()
      .then((economic) => {
        const lastUpdated = new Date().toISOString();
        saveToCache(CACHE_KEYS.economic, economic);
        saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
        set({ economicIndicators: economic, isLoadingEconomic: false, lastUpdated });
        console.log(`Economic indicators refreshed: ${economic.length} items`);
      })
      .catch((error) => {
        console.error('Economic refresh error:', error);
        set({ isLoadingEconomic: false });
      })
      .finally(updateCompletion);

    // News
    fetchAllNews()
      .then((news) => {
        saveToCache(CACHE_KEYS.news, news);
        set({ news, isLoadingNews: false });
        console.log(`News refreshed: ${news.length} articles`);
      })
      .catch((error) => {
        console.error('News refresh error:', error);
        set({ isLoadingNews: false });
      })
      .finally(updateCompletion);

    // Suppliers - Slowest
    fetchSupplierData()
      .then((suppliers) => {
        const lastUpdated = new Date().toISOString();
        saveToCache(CACHE_KEYS.suppliers, suppliers);
        saveToCache(CACHE_KEYS.lastUpdated, lastUpdated);
        set({ suppliers, isLoadingSuppliers: false, lastUpdated });
        console.log(`Suppliers refreshed: ${suppliers.length} items`);
      })
      .catch((error) => {
        console.error('Suppliers refresh error:', error);
        set({ isLoadingSuppliers: false });
      })
      .finally(updateCompletion);
  }
}));
