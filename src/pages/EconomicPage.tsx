import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { TrendingUp, TrendingDown, Activity, Building, Home, DollarSign } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';
import { KPICard } from '../components/dashboard/KPICard';
import { TrendIndicator } from '../components/dashboard/TrendIndicator';
import { DataTable } from '../components/tables/DataTable';
import { formatNumber, formatPercent } from '../utils/formatters';
import type { EconomicIndicator } from '../types';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const indicatorIcons: Record<string, React.ReactNode> = {
  'fed-rate': <DollarSign className="w-4 h-4 text-accent-cyan" />,
  'unemployment': <Activity className="w-4 h-4 text-accent-amber" />,
  'cpi': <TrendingUp className="w-4 h-4 text-risk-high" />,
  'housing-starts': <Home className="w-4 h-4 text-risk-low" />,
  'building-permits': <Building className="w-4 h-4 text-accent-purple" />,
  'ppi-construction': <TrendingDown className="w-4 h-4 text-accent-cyan" />
};

export function EconomicPage() {
  const { economicIndicators } = useDashboardStore();

  const columns = useMemo<ColumnDef<EconomicIndicator, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Indicator',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-terminal-surface border border-terminal-border flex items-center justify-center">
              {indicatorIcons[row.original.id] || <Activity className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-medium text-text-primary">{row.original.name}</div>
              <div className="text-[10px] text-text-muted">{row.original.source}</div>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'value',
        header: 'Current',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-text-primary">
            {formatNumber(row.original.value)}{row.original.unit}
          </span>
        )
      },
      {
        accessorKey: 'previousValue',
        header: 'Previous',
        cell: ({ row }) => (
          <span className="font-mono text-text-muted">
            {formatNumber(row.original.previousValue)}{row.original.unit}
          </span>
        )
      },
      {
        accessorKey: 'change',
        header: 'Change',
        cell: ({ row }) => (
          <span className="font-mono">
            {row.original.change >= 0 ? '+' : ''}{formatNumber(row.original.change)}
          </span>
        )
      },
      {
        accessorKey: 'changePercent',
        header: 'Change %',
        cell: ({ getValue }) => <TrendIndicator value={getValue() as number} size="sm" />
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="text-xs text-text-secondary max-w-[200px] truncate block">
            {getValue() as string}
          </span>
        )
      }
    ],
    []
  );

  // Get key indicators for KPI cards
  const keyIndicators = economicIndicators.slice(0, 4);

  // Prepare chart data
  const housingData = economicIndicators.find(i => i.id === 'housing-starts')?.historicalData || [];
  const inflationData = economicIndicators.find(i => i.id === 'cpi')?.historicalData || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyIndicators.map((indicator, index) => (
          <KPICard
            key={indicator.id}
            title={indicator.name}
            value={`${formatNumber(indicator.value)}${indicator.unit}`}
            change={indicator.changePercent}
            changeLabel="vs Previous"
            icon={indicatorIcons[indicator.id]}
            sparklineData={indicator.historicalData.map((d) => ({ value: d.value }))}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Housing Starts Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="terminal-card p-4"
        >
          <h3 className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-4">
            Housing Starts (Millions)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={housingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5a6478', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5a6478', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181c25',
                    border: '1px solid #2a3142',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#00d4ff', fontFamily: 'JetBrains Mono' }}
                  itemStyle={{ color: '#e4e8f0', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="value" fill="#00ff88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Inflation Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="terminal-card p-4"
        >
          <h3 className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-4">
            CPI Inflation Rate (%)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inflationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5a6478', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5a6478', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181c25',
                    border: '1px solid #2a3142',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#00d4ff', fontFamily: 'JetBrains Mono' }}
                  itemStyle={{ color: '#e4e8f0', fontFamily: 'JetBrains Mono' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ff6b35"
                  strokeWidth={2}
                  dot={{ fill: '#ff6b35', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable
        data={economicIndicators}
        columns={columns}
        searchPlaceholder="Search indicators..."
      />
    </div>
  );
}
