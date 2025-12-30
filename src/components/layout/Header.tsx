import { RefreshCw, Activity, Zap } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { formatRelativeTime } from '../../utils/formatters';
import { motion } from 'framer-motion';

export function Header() {
  const { lastUpdated, isLoading, refreshData } = useDashboardStore();

  return (
    <header className="header-glow bg-terminal-surface/80 backdrop-blur-sm border-b border-terminal-border sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <motion.div
              className="relative flex-shrink-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent-cyan" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-risk-low status-online" />
            </motion.div>

            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-xl font-bold tracking-wider text-text-primary truncate">
                SUPPLIER INTELLIGENCE
              </h1>
              <p className="text-[10px] sm:text-xs text-text-muted font-mono tracking-wide hidden sm:block">
                SOUTHERN CALIFORNIA CONSTRUCTION MARKET
              </p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-risk-low/10 border border-risk-low/30">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-risk-low animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono text-risk-low uppercase tracking-wider hidden xs:inline">
                Live
              </span>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-[10px] sm:text-xs font-mono text-text-muted hidden md:block">
                Updated: {formatRelativeTime(lastUpdated)}
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="btn-terminal flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2"
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
