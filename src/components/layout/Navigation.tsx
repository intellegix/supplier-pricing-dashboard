import { BarChart3, Building2, TrendingUp, Newspaper, Cloud } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { TabId } from '../../types';
import { motion } from 'framer-motion';

interface NavItem {
  id: TabId;
  label: string;
  icon: typeof BarChart3;
}

const navItems: NavItem[] = [
  { id: 'commodities', label: 'Commodities', icon: BarChart3 },
  { id: 'suppliers', label: 'Suppliers', icon: Building2 },
  { id: 'economic', label: 'Economic', icon: TrendingUp },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'weather', label: 'Weather', icon: Cloud }
];

export function Navigation() {
  const { activeTab, setActiveTab } = useDashboardStore();

  return (
    <nav className="bg-terminal-surface/50 border-b border-terminal-border">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab flex items-center gap-2 py-4 ${
                  isActive ? 'active' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan"
                    style={{ boxShadow: '0 0 10px var(--accent-cyan)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
