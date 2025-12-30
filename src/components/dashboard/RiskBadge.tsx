import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const normalizedLevel = level.toUpperCase();

  const getBadgeClass = () => {
    switch (normalizedLevel) {
      case 'LOW':
        return 'badge-risk-low';
      case 'MODERATE':
        return 'badge-risk-moderate';
      case 'HIGH':
        return 'badge-risk-high';
      case 'CRITICAL':
      case 'VERY HIGH':
        return 'badge-risk-critical';
      default:
        return 'bg-terminal-border text-text-muted border border-terminal-border';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-1.5 py-0.5 text-[10px]';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium uppercase tracking-wider rounded ${getBadgeClass()} ${getSizeClass()}`}
    >
      {normalizedLevel}
    </span>
  );
}
