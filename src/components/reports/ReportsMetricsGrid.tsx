import React from 'react';
import { DollarSign, Receipt, PiggyBank, TrendingUp, Percent } from 'lucide-react';
import { ReportsStats } from '../../hooks/useReportsStats';

interface ReportsMetricsGridProps {
  stats: ReportsStats;
}

export const ReportsMetricsGrid: React.FC<ReportsMetricsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Ingresos Brutos</span>
          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
        </div>
        <p className="text-lg sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
          ${stats.totalRevenue.toFixed(2)}
        </p>
        <div className="text-[11px] text-slate-400 mt-1">{stats.salesCount} tickets emitidos</div>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Costo de Mercancía</span>
          <Receipt className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <p className="text-lg sm:text-2xl font-extrabold font-mono text-slate-700 tabular-nums">
          ${stats.totalCost.toFixed(2)}
        </p>
        <div className="text-[11px] text-slate-400 mt-1">Costo de adquisición</div>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Utilidad Neta</span>
          <PiggyBank className="w-4 h-4 text-emerald-600 shrink-0" />
        </div>
        <p className="text-lg sm:text-2xl font-extrabold font-mono text-emerald-700 tabular-nums">
          ${stats.totalProfit.toFixed(2)}
        </p>
        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span>{stats.overallMargin.toFixed(1)}% margen global</span>
        </div>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Ticket Promedio</span>
          <Percent className="w-4 h-4 text-blue-600 shrink-0" />
        </div>
        <p className="text-lg sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
          ${stats.averageTicket.toFixed(2)}
        </p>
        <div className="text-[11px] text-slate-400 mt-1">Gasto promedio por cliente</div>
      </div>
    </div>
  );
};
