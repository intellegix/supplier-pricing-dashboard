import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Package, Flame, Droplets, Zap, DollarSign, CircleDot } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';
import { KPICard } from '../components/dashboard/KPICard';
import { RiskBadge } from '../components/dashboard/RiskBadge';
import { TrendIndicator } from '../components/dashboard/TrendIndicator';
import { DataTable } from '../components/tables/DataTable';
import { PriceChart } from '../components/charts/PriceChart';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import type { CommodityData } from '../types';

const commodityIcons: Record<string, React.ReactNode> = {
  lumber: <Package className="w-4 h-4 text-accent-amber" />,
  steel: <CircleDot className="w-4 h-4 text-text-secondary" />,
  copper: <CircleDot className="w-4 h-4 text-accent-amber" />,
  oil: <Droplets className="w-4 h-4 text-text-secondary" />,
  natgas: <Flame className="w-4 h-4 text-accent-cyan" />,
  usd: <DollarSign className="w-4 h-4 text-risk-low" />,
  gold: <Zap className="w-4 h-4 text-accent-amber" />,
  silver: <CircleDot className="w-4 h-4 text-text-secondary" />
};

export function CommoditiesPage() {
  const { commodities } = useDashboardStore();

  const columns = useMemo<ColumnDef<CommodityData, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Commodity',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {commodityIcons[row.original.id] || <CircleDot className="w-4 h-4" />}
            <div>
              <div className="font-medium text-text-primary">{row.original.name}</div>
              <div className="text-[10px] text-text-muted">{row.original.symbol}</div>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'currentPrice',
        header: 'Price',
        cell: ({ getValue }) => (
          <span className="font-mono">{formatCurrency(getValue() as number)}</span>
        )
      },
      {
        accessorKey: 'dailyChangePercent',
        header: 'Daily',
        cell: ({ getValue }) => <TrendIndicator value={getValue() as number} size="sm" />
      },
      {
        accessorKey: 'monthlyChangePercent',
        header: '30D',
        cell: ({ getValue }) => <TrendIndicator value={getValue() as number} size="sm" />
      },
      {
        accessorKey: 'quarterlyChangePercent',
        header: '90D',
        cell: ({ getValue }) => <TrendIndicator value={getValue() as number} size="sm" />
      },
      {
        accessorKey: 'volatility',
        header: 'Volatility',
        cell: ({ getValue }) => (
          <span className="font-mono text-text-secondary">{formatNumber(getValue() as number)}%</span>
        )
      },
      {
        accessorKey: 'riskLevel',
        header: 'Risk',
        cell: ({ getValue }) => <RiskBadge level={getValue() as string} size="sm" />
      },
      {
        accessorKey: 'priceImpact',
        header: 'Impact',
        cell: ({ getValue }) => (
          <span className="text-xs font-mono text-text-secondary uppercase">{getValue() as string}</span>
        )
      }
    ],
    []
  );

  // Top commodities by volatility for KPI cards
  const topCommodities = [...commodities].sort((a, b) => b.volatility - a.volatility).slice(0, 4);

  // Find the commodity with the highest quarterly change for chart
  const featuredCommodity = [...commodities].sort(
    (a, b) => Math.abs(b.quarterlyChangePercent) - Math.abs(a.quarterlyChangePercent)
  )[0];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topCommodities.map((commodity, index) => (
          <KPICard
            key={commodity.id}
            title={commodity.name}
            value={formatCurrency(commodity.currentPrice)}
            change={commodity.dailyChangePercent}
            changeLabel="Daily Change"
            riskLevel={commodity.riskLevel}
            icon={commodityIcons[commodity.id]}
            sparklineData={commodity.historicalPrices.slice(-30).map((p) => ({ value: p.price }))}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {featuredCommodity && (
          <PriceChart
            data={featuredCommodity.historicalPrices}
            title={`${featuredCommodity.name} - 90 Day Price History`}
          />
        )}
        {commodities[1] && (
          <PriceChart
            data={commodities[1].historicalPrices}
            title={`${commodities[1].name} - 90 Day Price History`}
          />
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={commodities}
        columns={columns}
        searchPlaceholder="Search commodities..."
      />
    </div>
  );
}
