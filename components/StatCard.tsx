import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  highlight?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, subtitle, icon, highlight, trend }: StatCardProps) {
  return (
    <div className={`rounded-xl border ${highlight ? 'border-primary bg-gradient-to-br from-primary/10 to-card' : 'border-border'} bg-card p-6 hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
          {trend && (
            <div className={`text-xs font-semibold mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </div>
          )}
        </div>
        {icon && <div className="text-primary ml-4 opacity-20">{icon}</div>}
      </div>
    </div>
  );
}
