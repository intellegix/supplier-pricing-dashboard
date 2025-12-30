import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

interface PriceChartProps {
  data: { date: string; price: number }[];
  title: string;
  color?: string;
  height?: number;
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

  // Format data for display (show fewer labels)
  const formattedData = data.map((d, i) => ({
    ...d,
    displayDate: i % 15 === 0 ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
  }));

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

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
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
            <Tooltip
              contentStyle={{
                backgroundColor: '#181c25',
                border: '1px solid #2a3142',
                borderRadius: '8px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)'
              }}
              labelStyle={{ color: '#00d4ff', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              itemStyle={{ color: '#e4e8f0', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Price']}
              labelFormatter={(label) => label || ''}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
