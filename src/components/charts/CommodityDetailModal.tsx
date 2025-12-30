import { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import type { CommodityData } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { RiskBadge } from '../dashboard/RiskBadge';

interface CommodityDetailModalProps {
  commodity: CommodityData | null;
  onClose: () => void;
}

type TimeRange = '30D' | '60D' | '3M' | '6M' | '1Y' | '5Y' | 'YTD';

interface ChartDataPoint {
  date: string;
  price: number;
  index: number;
  displayDate: string;
  fullDate: string;
}

const timeRanges: { key: TimeRange; label: string; days: number }[] = [
  { key: '30D', label: '30 Days', days: 30 },
  { key: '60D', label: '60 Days', days: 60 },
  { key: '3M', label: '3 Months', days: 90 },
  { key: '6M', label: '6 Months', days: 180 },
  { key: '1Y', label: '1 Year', days: 365 },
  { key: '5Y', label: '5 Years', days: 1825 },
  { key: 'YTD', label: 'YTD', days: -1 }, // Special case: calculated dynamically
];

export function CommodityDetailModal({ commodity, onClose }: CommodityDetailModalProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3M');

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!commodity?.historicalPrices) return [];

    const range = timeRanges.find(r => r.key === selectedRange);
    let daysToShow = range?.days || 90;

    // Calculate YTD days
    if (range?.key === 'YTD') {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      daysToShow = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Get the last N days of data (or all if we don't have enough)
    const dataLength = commodity.historicalPrices.length;
    const startIndex = Math.max(0, dataLength - daysToShow);

    return commodity.historicalPrices.slice(startIndex).map((d, i) => ({
      ...d,
      index: i,
      displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date(d.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }));
  }, [commodity, selectedRange]);

  const stats = useMemo(() => {
    if (!chartData.length) return null;

    const prices = chartData.map(d => d.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      change,
      changePercent,
      high,
      low,
      avg,
      isUp: change >= 0
    };
  }, [chartData]);

  if (!commodity) return null;

  const chartColor = stats?.isUp ? '#10b981' : '#ef4444';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="terminal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-terminal-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-primary-400">{commodity.symbol}</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary">{commodity.name}</h2>
                <p className="text-sm text-text-muted">{commodity.priceImpact}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-terminal-surface border border-terminal-border flex items-center justify-center hover:bg-terminal-border transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Price & Stats */}
          <div className="p-6 border-b border-terminal-border">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-display text-4xl font-bold text-text-primary">
                    {formatCurrency(commodity.currentPrice)}
                  </span>
                  {stats && (
                    <div className={`flex items-center gap-1 pb-1 ${stats.isUp ? 'text-risk-low' : 'text-risk-high'}`}>
                      {stats.isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span className="font-mono text-lg">
                        {stats.isUp ? '+' : ''}{formatNumber(stats.changePercent)}%
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-text-muted mt-1">
                  {selectedRange === 'YTD' ? 'Year to Date' : timeRanges.find(r => r.key === selectedRange)?.label} Change
                </p>
              </div>
              <div className="flex items-center gap-4">
                <RiskBadge level={commodity.riskLevel} size="lg" />
                <div className="flex items-center gap-2 px-3 py-2 bg-terminal-surface rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-accent-amber" />
                  <span className="text-sm font-mono text-text-secondary">
                    Vol: {formatNumber(commodity.volatility)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="px-6 py-4 border-b border-terminal-border">
            <div className="flex items-center gap-2 flex-wrap">
              {timeRanges.map((range) => (
                <button
                  key={range.key}
                  onClick={() => setSelectedRange(range.key)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedRange === range.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-terminal-surface text-text-secondary hover:bg-terminal-border hover:text-text-primary'
                  }`}
                >
                  {range.key}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="p-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a3142"
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="index"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#5a6478', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(index: number) => {
                      const point = chartData[index];
                      // Show fewer labels for better readability
                      const totalPoints = chartData.length;
                      const showLabel = index === 0 || index === totalPoints - 1 ||
                        index === Math.floor(totalPoints / 2);
                      return showLabel && point ? point.displayDate : '';
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#5a6478', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    width={70}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    domain={['auto', 'auto']}
                  />
                  {stats && (
                    <ReferenceLine
                      y={stats.avg}
                      stroke="#5a6478"
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />
                  )}
                  <Tooltip
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: '#141820',
                      border: '1px solid #252d3d',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ color: '#3b82f6', fontFamily: 'JetBrains Mono', fontSize: 12, marginBottom: 4 }}
                    itemStyle={{ color: '#f1f5f9', fontFamily: 'JetBrains Mono', fontSize: 14 }}
                    formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'Price']}
                    labelFormatter={(_label, payload) => {
                      if (payload && payload.length > 0 && payload[0]?.payload) {
                        return payload[0].payload.fullDate;
                      }
                      return '';
                    }}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill="url(#colorPrice)"
                    animationDuration={500}
                    activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2, fill: '#141820' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-terminal-surface rounded-lg">
                  <p className="text-xs font-mono text-text-muted uppercase mb-1">Period High</p>
                  <p className="text-lg font-display font-bold text-risk-low">{formatCurrency(stats.high)}</p>
                </div>
                <div className="p-4 bg-terminal-surface rounded-lg">
                  <p className="text-xs font-mono text-text-muted uppercase mb-1">Period Low</p>
                  <p className="text-lg font-display font-bold text-risk-high">{formatCurrency(stats.low)}</p>
                </div>
                <div className="p-4 bg-terminal-surface rounded-lg">
                  <p className="text-xs font-mono text-text-muted uppercase mb-1">Average</p>
                  <p className="text-lg font-display font-bold text-text-primary">{formatCurrency(stats.avg)}</p>
                </div>
                <div className="p-4 bg-terminal-surface rounded-lg">
                  <p className="text-xs font-mono text-text-muted uppercase mb-1">Change</p>
                  <p className={`text-lg font-display font-bold ${stats.isUp ? 'text-risk-low' : 'text-risk-high'}`}>
                    {stats.isUp ? '+' : ''}{formatCurrency(stats.change)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SoCal Impact */}
          <div className="px-6 pb-6">
            <div className="p-4 bg-primary-500/5 border border-primary-500/15 rounded-lg">
              <h4 className="text-sm font-medium uppercase tracking-wide text-primary-400 mb-2">SoCal Construction Impact</h4>
              <p className="text-sm text-text-secondary">{commodity.socalImpact}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
