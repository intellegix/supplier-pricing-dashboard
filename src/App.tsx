import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { CommoditiesPage } from './pages/CommoditiesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { EconomicPage } from './pages/EconomicPage';
import { NewsPage } from './pages/NewsPage';
import { WeatherPage } from './pages/WeatherPage';
import { useDashboardStore } from './stores/dashboardStore';

function App() {
  const { activeTab, fetchData, loadCachedData, isLoading } = useDashboardStore();

  // Load cached data first, then fetch fresh data in background
  useEffect(() => {
    // Try to load cached data immediately
    loadCachedData();
    // Then fetch fresh data (will show as refreshing if cache exists)
    fetchData();
  }, [fetchData, loadCachedData]);

  // Render active page
  const renderPage = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    switch (activeTab) {
      case 'commodities':
        return <CommoditiesPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'economic':
        return <EconomicPage />;
      case 'news':
        return <NewsPage />;
      case 'weather':
        return <WeatherPage />;
      default:
        return <CommoditiesPage />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
}

function LoadingState() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="terminal-card p-4 h-32">
            <div className="skeleton h-4 w-24 rounded mb-3" />
            <div className="skeleton h-8 w-32 rounded mb-2" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="terminal-card p-4 h-[300px]">
            <div className="skeleton h-4 w-48 rounded mb-4" />
            <div className="skeleton h-full w-full rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="terminal-card p-4">
        <div className="skeleton h-10 w-full rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-12 w-full rounded mb-2" />
        ))}
      </div>
    </div>
  );
}

export default App;
