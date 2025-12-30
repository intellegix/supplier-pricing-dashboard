import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPercent } from '../../utils/formatters';

interface TrendIndicatorProps {
  value: number | null;
  showIcon?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean; // For metrics where down is good
}

export function TrendIndicator({
  value,
  showIcon = true,
  showValue = true,
  size = 'md',
  inverted = false
}: TrendIndicatorProps) {
  if (value === null) {
    return <span className="text-text-muted font-mono text-sm">N/A</span>;
  }

  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;

  const getColorClass = () => {
    if (isPositive) return 'text-risk-low';
    if (isNegative) return 'text-risk-critical';
    return 'text-text-muted';
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  };

  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium ${getColorClass()} ${getSizeClass()}`}
    >
      {showIcon && <Icon size={getIconSize()} />}
      {showValue && formatPercent(value)}
    </span>
  );
}
