import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';
import { KPICard } from '../components/dashboard/KPICard';
import { RiskBadge } from '../components/dashboard/RiskBadge';
import { TrendIndicator } from '../components/dashboard/TrendIndicator';
import { DataTable } from '../components/tables/DataTable';
import { PriceChart } from '../components/charts/PriceChart';
import { SupplierDetailModal } from '../components/charts/SupplierDetailModal';
import { formatNumber, formatPercent } from '../utils/formatters';
import type { SupplierData } from '../types';
import { motion } from 'framer-motion';

export function SuppliersPage() {
  const { suppliers } = useDashboardStore();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);

  const columns = useMemo<ColumnDef<SupplierData, unknown>[]>(
    () => [
      {
        accessorKey: 'ticker',
        header: 'Ticker',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <span className="text-xs font-bold text-accent-cyan">{row.original.ticker.slice(0, 2)}</span>
            </div>
            <div>
              <div className="font-mono font-bold text-accent-cyan">{row.original.ticker}</div>
              <div className="text-[10px] text-text-muted truncate max-w-[120px]">{row.original.company}</div>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'focusArea',
        header: 'Sector',
        cell: ({ getValue }) => (
          <span className="text-xs text-text-secondary">{getValue() as string}</span>
        )
      },
      {
        accessorKey: 'marketCap',
        header: 'Market Cap',
        cell: ({ getValue }) => (
          <span className="font-mono text-text-primary">{getValue() as string}</span>
        )
      },
      {
        accessorKey: 'grossMargin',
        header: 'Gross %',
        cell: ({ getValue }) => (
          <span className="font-mono">{formatNumber(getValue() as number)}%</span>
        )
      },
      {
        accessorKey: 'weeklyPerformance',
        header: '1W',
        cell: ({ getValue }) => <TrendIndicator value={getValue() as number} size="sm" />
      },
      {
        accessorKey: 'monthlyPerformance',
        header: '1M',
        cell: ({ getValue }) => <TrendIndicator value={getValue() as number} size="sm" />
      },
      {
        accessorKey: 'quarterlyPerformance',
        header: '3M',
        cell: ({ getValue }) => <TrendIndicator value={getValue() as number} size="sm" />
      },
      {
        accessorKey: 'financialHealth',
        header: 'Health',
        cell: ({ getValue }) => {
          const health = getValue() as string;
          const level = health === 'EXCELLENT' ? 'LOW' : health === 'GOOD' ? 'MODERATE' : 'HIGH';
          return <RiskBadge level={level} size="sm" />;
        }
      },
      {
        accessorKey: 'investmentGrade',
        header: 'Grade',
        cell: ({ getValue }) => (
          <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 rounded text-xs font-mono">
            {getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'socalRelevanceScore',
        header: 'SoCal',
        cell: ({ getValue }) => {
          const score = getValue() as number;
          const color = score >= 85 ? 'text-risk-low' : score >= 70 ? 'text-accent-amber' : 'text-text-muted';
          return <span className={`font-mono font-bold ${color}`}>{score}</span>;
        }
      }
    ],
    []
  );

  // Top performers for KPI cards
  const topPerformers = [...suppliers]
    .sort((a, b) => b.quarterlyPerformance - a.quarterlyPerformance)
    .slice(0, 4);

  // Get top 2 suppliers for charts
  const chartSuppliers = [...suppliers]
    .sort((a, b) => b.socalRelevanceScore - a.socalRelevanceScore)
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* KPI Cards - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topPerformers.map((supplier, index) => (
          <div
            key={supplier.id}
            onClick={() => setSelectedSupplier(supplier)}
            className="cursor-pointer transform transition-transform hover:scale-[1.02]"
          >
            <KPICard
              title={supplier.ticker}
              subtitle={supplier.company}
              value={`$${supplier.currentPrice.toFixed(2)}`}
              change={supplier.quarterlyPerformance}
              changeLabel="Quarterly"
              icon={<Building2 className="w-4 h-4 text-accent-cyan" />}
              sparklineData={supplier.historicalPrices.slice(-30).map((p) => ({ value: p.price }))}
              delay={index * 0.1}
            />
          </div>
        ))}
      </div>

      {/* Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="terminal-card p-4"
      >
        <h3 className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-4">
          Market Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-terminal-surface rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-risk-low" />
              <span className="text-xs font-mono text-text-muted uppercase">Avg Q Performance</span>
            </div>
            <div className="text-xl font-display font-bold text-risk-low">
              {formatPercent(suppliers.reduce((acc, s) => acc + s.quarterlyPerformance, 0) / suppliers.length)}
            </div>
          </div>
          <div className="p-3 bg-terminal-surface rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-accent-cyan" />
              <span className="text-xs font-mono text-text-muted uppercase">Avg Gross Margin</span>
            </div>
            <div className="text-xl font-display font-bold text-accent-cyan">
              {formatNumber(suppliers.reduce((acc, s) => acc + (s.grossMargin || 0), 0) / suppliers.length)}%
            </div>
          </div>
          <div className="p-3 bg-terminal-surface rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-accent-amber" />
              <span className="text-xs font-mono text-text-muted uppercase">Avg P/E Ratio</span>
            </div>
            <div className="text-xl font-display font-bold text-accent-amber">
              {formatNumber(suppliers.reduce((acc, s) => acc + (s.peRatio || 0), 0) / suppliers.length)}
            </div>
          </div>
          <div className="p-3 bg-terminal-surface rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-accent-purple" />
              <span className="text-xs font-mono text-text-muted uppercase">Total Tracked</span>
            </div>
            <div className="text-xl font-display font-bold text-accent-purple">{suppliers.length}</div>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartSuppliers.map((supplier) => (
          <PriceChart
            key={supplier.id}
            data={supplier.historicalPrices}
            title={`${supplier.ticker} - ${supplier.company}`}
          />
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        data={suppliers}
        columns={columns}
        searchPlaceholder="Search suppliers..."
        onRowClick={(supplier) => setSelectedSupplier(supplier)}
      />

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <SupplierDetailModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
}
