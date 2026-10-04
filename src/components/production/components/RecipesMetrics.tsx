// src/components/production/RecipesMetrics.tsx
import React from 'react';
import { BookOpen, DollarSign, Layers } from 'lucide-react';

interface RecipesMetricsProps {
  metrics: {
    totalCount: number;
    totalCost: string;
    avgCost: string;
  };
}

export const RecipesMetrics: React.FC<RecipesMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500">Total Recetas</span>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {metrics.totalCount}
          </p>
          <span className="text-[11px] text-slate-400">productos con receta</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500">Costo Total en Costos</span>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            ${metrics.totalCost}
          </p>
          <span className="text-[11px] text-slate-400">suma de costos de producción</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500">Costo Promedio</span>
          <p className="text-2xl font-bold font-mono text-indigo-700 tabular-nums">
            ${metrics.avgCost}
          </p>
          <span className="text-[11px] text-indigo-600 font-semibold">por receta</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};