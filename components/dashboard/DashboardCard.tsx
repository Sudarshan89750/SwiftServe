import React, { ReactNode } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { CircleArrowDown, ArrowUp } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon,
  trend,
  trendLabel,
  className = ''
}) => {
  return (
    <GlassCard className={`dashboard-card ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 font-medium">{title}</h3>
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          {icon}
        </div>
      </div>
      <div>
        <div className="dashboard-value">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <CircleArrowDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend)}% {trendLabel || (trend >= 0 ? 'increase' : 'decrease')}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
