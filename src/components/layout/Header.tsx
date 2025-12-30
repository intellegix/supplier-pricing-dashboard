import { RefreshCw, Activity, Zap } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { formatRelativeTime } from '../../utils/formatters';
import { motion } from 'framer-motion';

export function Header() {
  const { lastUpdated, isLoading, refreshData } = useDashboardStore();

  return (
    <header className="header-glow bg-terminal-surface/80 backdrop-blur-sm border-b border-terminal-border sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-cyan" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-risk-low status-online" />
            </motion.div>

            <div>
              <h1 className="font-display text-xl font-bold tracking-wider text-text-primary">
                SUPPLIER INTELLIGENCE
              </h1>
              <p className="text-xs text-text-muted font-mono tracking-wide">
                SOUTHERN CALIFORNIA CONSTRUCTION MARKET
              </p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-6">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-risk-low/10 border border-risk-low/30">
              <Activity className="w-3.5 h-3.5 text-risk-low animate-pulse" />
              <span className="text-xs font-mono text-risk-low uppercase tracking-wider">
                Live Data
              </span>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-xs font-mono text-text-muted">
                Updated: {formatRelativeTime(lastUpdated)}
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="btn-terminal flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
