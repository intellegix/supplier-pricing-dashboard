import { useCallback } from 'react';
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
import { motion } from 'framer-motion';

interface PriceChartProps {
  data: { date: string; price: number }[];
  title: string;
  color?: string;
  height?: number;
}

interface ChartDataPoint {
  date: string;
  price: number;
  fullDate: string;
  displayDate: string;
  index: number;
}

export function PriceChart({
  data,
  title,
  color: _color = '#00d4ff',
  height = 250
}: PriceChartProps) {
  void _color; // Used for future customization

  // Calculate if trend is up or down
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isUp = lastPrice >= firstPrice;
  const chartColor = isUp ? '#00ff88' : '#ff3366';

  // Format data for display with precise date tracking
  // Show labels at start, ~30 days, ~60 days, and end for better date visibility
  const totalPoints = data.length;
  const formattedData: ChartDataPoint[] = data.map((d, i) => {
    const showLabel = i === 0 || i === totalPoints - 1 ||
      (totalPoints > 60 && (i === Math.floor(totalPoints / 3) || i === Math.floor(2 * totalPoints / 3)));
    return {
      ...d,
      index: i,
      fullDate: new Date(d.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      displayDate: showLabel ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
    };
  });

  // Custom tooltip formatter with precise date
  const formatTooltipLabel = useCallback((_label: unknown, payload: ReadonlyArray<{ payload?: ChartDataPoint }>) => {
    if (payload && payload.length > 0 && payload[0]?.payload) {
      const dataPoint = payload[0].payload;
      return dataPoint.fullDate;
    }
    return '';
  }, []);

  // Calculate average price for reference line
  const avgPrice = data.length > 0
    ? data.reduce((sum, d) => sum + d.price, 0) / data.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="terminal-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-text-secondary">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted">90 DAYS</span>
        </div>
      </div>

      {/* Prevent touch scrolling on chart area */}
      <div style={{ height, touchAction: 'none' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
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
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5a6478', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5a6478', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              width={60}
              tickFormatter={(value) => value.toLocaleString()}
              domain={['auto', 'auto']}
            />
            <ReferenceLine
              y={avgPrice}
              stroke="#5a6478"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Tooltip
              cursor={{ stroke: '#00d4ff', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#181c25',
                border: '1px solid #2a3142',
                borderRadius: '8px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#00d4ff', fontFamily: 'JetBrains Mono', fontSize: 11, marginBottom: 4 }}
              itemStyle={{ color: '#e4e8f0', fontFamily: 'JetBrains Mono', fontSize: 12 }}
              formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
              labelFormatter={formatTooltipLabel}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
              animationDuration={1000}
              activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2, fill: '#181c25' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
