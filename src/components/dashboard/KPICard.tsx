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
  const sparklineColor = change >= 0 ? '#00ff88' : '#ff3366';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="kpi-card group hover:border-accent-cyan/30 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-text-muted/60 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {riskLevel && <RiskBadge level={riskLevel} size="sm" />}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div>
          <div className="kpi-value">{value}</div>
          <div className="flex items-center gap-2 mt-1">
            <TrendIndicator value={change} size="sm" />
            <span className="text-[10px] text-text-muted font-mono uppercase">
              {changeLabel}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
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

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 212, 255, 0.05) 0%, transparent 70%)'
        }}
      />
    </motion.div>
  );
}
