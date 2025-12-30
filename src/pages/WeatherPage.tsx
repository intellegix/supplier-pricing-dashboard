import { useState } from 'react';
import { Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, MapPin, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';
import { formatRelativeTime } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import type { DailyForecast } from '../types';

const getWeatherIcon = (condition: string, size: 'sm' | 'lg' = 'lg') => {
  const lowerCondition = condition.toLowerCase();
  const sizeClass = size === 'lg' ? 'w-12 h-12' : 'w-6 h-6';

  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
    return <Sun className={`${sizeClass} text-accent-amber`} />;
  }
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    return <CloudRain className={`${sizeClass} text-accent-cyan`} />;
  }
  if (lowerCondition.includes('cloud') || lowerCondition.includes('partly') || lowerCondition.includes('overcast')) {
    return <Cloud className={`${sizeClass} text-text-secondary`} />;
  }
  if (lowerCondition.includes('fog')) {
    return <Cloud className={`${sizeClass} text-text-muted`} />;
  }
  return <Sun className={`${sizeClass} text-accent-amber`} />;
};

const getConditionGradient = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
    return 'from-accent-amber/20 to-accent-amber/5';
  }
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    return 'from-accent-cyan/20 to-accent-cyan/5';
  }
  return 'from-text-secondary/20 to-text-secondary/5';
};

function ForecastRow({ day }: { day: DailyForecast }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-terminal-surface/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3 min-w-[100px]">
        <span className="font-mono text-sm text-text-primary w-12">{day.dayName}</span>
        {getWeatherIcon(day.condition, 'sm')}
      </div>
      <span className="text-xs text-text-muted font-mono flex-1 text-center hidden sm:block">
        {day.condition}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3 text-accent-cyan" />
          <span className="text-xs font-mono text-text-muted">{day.precipitationProbability}%</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <span className="font-mono text-sm text-text-primary">{day.high}°</span>
          <span className="text-text-muted">/</span>
          <span className="font-mono text-sm text-text-muted">{day.low}°</span>
        </div>
      </div>
    </div>
  );
}

export function WeatherPage() {
  const { weather, isLoadingWeather } = useDashboardStore();
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

  const toggleExpanded = (location: string) => {
    setExpandedLocation(expandedLocation === location ? null : location);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="terminal-card p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">
                Southern California Weather
              </h2>
              <p className="text-sm text-text-muted font-mono">
                Current conditions • Click for 7-day forecast
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoadingWeather && (
              <div className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            )}
            <div className="text-xs font-mono text-text-muted">
              Updated: {formatRelativeTime(weather[0]?.time || new Date().toISOString())}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {weather.map((location, index) => {
          const isExpanded = expandedLocation === location.location;
          const hasForecast = location.forecast && location.forecast.length > 0;

          return (
            <motion.div
              key={location.location}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="terminal-card overflow-hidden group"
            >
              {/* Clickable Header */}
              <div
                onClick={() => hasForecast && toggleExpanded(location.location)}
                className={`p-6 bg-gradient-to-br ${getConditionGradient(location.condition)} ${hasForecast ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-text-primary mb-1">
                      {location.location}
                    </h3>
                    <p className="text-sm text-text-secondary font-mono">
                      {location.condition}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      {getWeatherIcon(location.condition)}
                    </div>
                    {hasForecast && (
                      <div className="text-text-muted">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Temperature */}
                <div className="mt-4">
                  <div className="flex items-end gap-1">
                    <span className="font-display text-5xl font-bold text-text-primary">
                      {location.temperature}
                    </span>
                    <span className="text-2xl text-text-muted mb-1">°F</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-terminal-surface flex items-center justify-center">
                    <Wind className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-text-muted uppercase">Wind</p>
                    <p className="text-sm font-mono text-text-primary">{location.windSpeed} mph</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-terminal-surface flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-text-muted uppercase">Humidity</p>
                    <p className="text-sm font-mono text-text-primary">{location.humidity || 'N/A'}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-terminal-surface flex items-center justify-center">
                    <CloudRain className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-text-muted uppercase">Precip</p>
                    <p className="text-sm font-mono text-text-primary">{location.precipitationProbability || 0}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-terminal-surface flex items-center justify-center">
                    <Thermometer className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-text-muted uppercase">Feels</p>
                    <p className="text-sm font-mono text-text-primary">{location.temperature}°F</p>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast (Expandable) */}
              <AnimatePresence>
                {isExpanded && location.forecast && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-terminal-border"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-accent-cyan" />
                        <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">
                          7-Day Forecast
                        </span>
                      </div>
                      <div className="space-y-1">
                        {location.forecast.map((day) => (
                          <ForecastRow key={day.date} day={day} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Work Conditions Indicator */}
              <div className="px-4 pb-4">
                <div className="p-3 rounded-lg bg-risk-low/10 border border-risk-low/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
                    <span className="text-xs font-mono text-risk-low uppercase tracking-wider">
                      Good Working Conditions
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Construction Impact Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="terminal-card p-4"
      >
        <h3 className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-3">
          Weather Impact on Construction
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-terminal-surface rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-accent-amber" />
              <span className="font-mono text-text-primary">Concrete Work</span>
            </div>
            <p className="text-xs text-text-muted">
              Optimal conditions for pouring and curing
            </p>
          </div>
          <div className="p-3 bg-terminal-surface rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-accent-cyan" />
              <span className="font-mono text-text-primary">Crane Operations</span>
            </div>
            <p className="text-xs text-text-muted">
              Wind speeds within safe operating limits
            </p>
          </div>
          <div className="p-3 bg-terminal-surface rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-accent-cyan" />
              <span className="font-mono text-text-primary">Exterior Work</span>
            </div>
            <p className="text-xs text-text-muted">
              Low precipitation probability for roofing
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
