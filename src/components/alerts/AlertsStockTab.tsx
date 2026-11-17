import React from 'react';
import { Product } from '../../types';
import { CheckCircle2, PackageX, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface AlertsStockTabProps {
  lowStockProducts: Product[];
  onQuickRestock: (product: Product) => void;
}

export const AlertsStockTab: React.FC<AlertsStockTabProps> = ({
  lowStockProducts,
  onQuickRestock,
}) => {
  if (lowStockProducts.length === 0) {
    return (
      <div className="p-12 bg-white rounded-xl border border-slate-200 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">Inventario en Niveles Óptimos</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No hay productos con existencias por debajo del umbral mínimo de seguridad.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {lowStockProducts.map((p) => {
        const isOutOfStock = p.stock <= 0;
        const deficit = Math.max(0, p.min_stock_alert - p.stock);
        const suggestedOrder = Math.max(10, Math.ceil(p.min_stock_alert * 2 - p.stock));

        return (
          <div
            key={p.id}
            className={`p-4 rounded-xl border bg-white shadow-xs flex flex-col justify-between ${
              isOutOfStock ? 'border-rose-300 ring-1 ring-rose-200' : 'border-amber-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                {isOutOfStock ? (
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <PackageX className="w-3.5 h-3.5" />
                    <span>AGOTADO (0 {p.unit})</span>
                  </span>
                ) : (
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>STOCK CRÍTICO</span>
                  </span>
                )}
                <span className="font-mono text-slate-400 text-[10px]">{p.barcode}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>

              <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Stock Actual:</span>
                  <span className="font-bold font-mono text-slate-900 tabular-nums">
                    {p.stock} {p.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mínimo Permitido:</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {p.min_stock_alert} {p.unit}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-rose-700 font-semibold">
                  <span>Déficit de anaquel:</span>
                  <span className="font-mono tabular-nums">
                    -{deficit} {p.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Sugerido: <strong className="text-slate-800">+{suggestedOrder} {p.unit}</strong>
              </span>
              <button
                type="button"
                onClick={() => onQuickRestock(p)}
                className="min-h-[38px] flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reabastecer</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
