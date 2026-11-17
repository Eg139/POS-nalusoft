import React from 'react';
import { ReportsStats } from '../../hooks/useReportsStats';

interface ReportsTopProductsProps {
  stats: ReportsStats;
}

export const ReportsTopProducts: React.FC<ReportsTopProductsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 mb-1">Top 5 Más Vendidos (Volumen)</h3>
        <p className="text-xs text-slate-500 mb-3">Artículos de mayor rotación en góndola</p>

        <div className="divide-y divide-slate-100">
          {stats.topSellingProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Sin datos registrados.</p>
          ) : (
            stats.topSellingProducts.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 truncate block">{p.category}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                    {p.qty} unids.
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">${p.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 mb-1">Top 5 Más Rentables (Ganancia)</h3>
        <p className="text-xs text-slate-500 mb-3">Mayor contribución en pesos a la utilidad neta</p>

        <div className="divide-y divide-slate-100">
          {stats.mostProfitableProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Sin datos registrados.</p>
          ) : (
            stats.mostProfitableProducts.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 truncate block">{p.category}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-emerald-700 text-xs tabular-nums">
                    +${p.profit.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">${p.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
