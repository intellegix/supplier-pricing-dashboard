import { RefreshCw, Activity, BarChart3 } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { formatRelativeTime } from '../../utils/formatters';
import { motion } from 'framer-motion';

export function Header() {
  const { lastUpdated, isLoading, refreshData } = useDashboardStore();

  return (
    <header className="header-glow bg-terminal-surface/95 backdrop-blur-md border-b border-terminal-border sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <motion.div
              className="relative flex-shrink-0"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success-500 status-online" />
            </motion.div>

            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-lg font-semibold tracking-tight text-text-primary truncate">
                Supplier Intelligence
              </h1>
              <p className="text-[10px] sm:text-xs text-text-muted font-medium tracking-wide hidden sm:block">
                Southern California Construction Market
              </p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-success-500/10 border border-success-500/20">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-success-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-medium text-success-500 uppercase tracking-wider hidden xs:inline">
                Live
              </span>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-[10px] sm:text-xs font-medium text-text-muted hidden md:block">
                Updated {formatRelativeTime(lastUpdated)}
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="btn-terminal flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
