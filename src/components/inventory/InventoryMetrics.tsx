import React from 'react';
import { Boxes, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface InventoryMetricsProps {
  totalCount: number;
  totalCostVal: string;
  totalRetailVal: string;
  avgMargin: string;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
}

export const InventoryMetrics: React.FC<InventoryMetricsProps> = ({
  totalCount,
  totalCostVal,
  totalRetailVal,
  avgMargin,
  lowStockCount,
  outOfStockCount,
  expiringCount,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500">Total Productos / Stock</span>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalCount}</p>
          <span className="text-[11px] text-slate-400">ítems activos</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Boxes className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500">Valor a Costo</span>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">${totalCostVal}</p>
          <span className="text-[11px] text-slate-400">inversión en almacén</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500">Valor Venta Estimado</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">${totalRetailVal}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">+{avgMargin}% margen prom.</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500">Alertas de Inventario</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
              {lowStockCount + outOfStockCount}
            </span>
            <span className="text-xs text-rose-600 font-semibold">({outOfStockCount} agotados)</span>
          </div>
          <span className="text-[11px] text-slate-400">{expiringCount} por vencer pronto</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
