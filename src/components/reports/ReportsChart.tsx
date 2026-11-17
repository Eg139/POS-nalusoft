import React from 'react';
import { DailyChartItem } from '../../hooks/useReportsStats';

interface ReportsChartProps {
  dailyChartData: DailyChartItem[];
}

export const ReportsChart: React.FC<ReportsChartProps> = ({ dailyChartData }) => {
  const maxDayRevenue = Math.max(...dailyChartData.map((d) => d.revenue), 100);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Evolución de Ventas vs Ganancia Neta</h3>
          <p className="text-xs text-slate-500">Comparativa de facturación diaria</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-900 inline-block" />
            <span className="text-slate-600">Ventas ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-slate-600">Ganancia ($)</span>
          </div>
        </div>
      </div>

      {dailyChartData.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          No hay registros de ventas en este período para graficar.
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {dailyChartData.map((d) => {
            const revPercent = Math.min(100, (d.revenue / maxDayRevenue) * 100);
            const profPercent = Math.min(100, (d.profit / maxDayRevenue) * 100);

            return (
              <div key={d.dateStr} className="space-y-1">
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700">{d.label}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="text-slate-900 font-bold">${d.revenue.toFixed(2)}</span>
                    <span className="text-emerald-700 font-bold">Utilidad: ${d.profit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-full h-3.5 bg-slate-100 rounded-md overflow-hidden flex relative">
                  <div
                    style={{ width: `${revPercent}%` }}
                    className="h-full bg-slate-900 rounded-md transition-all duration-300"
                  />
                  <div
                    style={{ width: `${profPercent}%` }}
                    className="h-full bg-emerald-500 rounded-md absolute left-0 top-0 opacity-90 transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
