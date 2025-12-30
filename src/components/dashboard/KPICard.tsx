import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { RiskBadge } from './RiskBadge';
import { TrendIndicator } from './TrendIndicator';
import type { RiskLevel } from '../../types';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel?: string;
  riskLevel?: RiskLevel | string;
  sparklineData?: { value: number }[];
  icon?: React.ReactNode;
  subtitle?: string;
  delay?: number;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'Daily',
  riskLevel,
  sparklineData,
  icon,
  subtitle,
  delay = 0
}: KPICardProps) {
  // Professional color palette
  const sparklineColor = change >= 0 ? '#10b981' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="kpi-card group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-text-muted/70 mt-0.5 truncate max-w-[140px]">{subtitle}</p>
            )}
          </div>
        </div>
        {riskLevel && <RiskBadge level={riskLevel} size="sm" />}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div>
          <div className="kpi-value">{value}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <TrendIndicator value={change} size="sm" />
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">
              {changeLabel}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-20 h-10 opacity-50 group-hover:opacity-80 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={sparklineColor}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
