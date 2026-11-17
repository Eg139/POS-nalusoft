import React from 'react';
import { Product } from '../../types';
import { CheckCircle2, ArrowDownRight } from 'lucide-react';

interface AlertsExpiryTabProps {
  expiringProducts: Product[];
  today: Date;
  onMarkWaste: (product: Product) => void;
  onNavigateToInventory: () => void;
}

export const AlertsExpiryTab: React.FC<AlertsExpiryTabProps> = ({
  expiringProducts,
  today,
  onMarkWaste,
  onNavigateToInventory,
}) => {
  if (expiringProducts.length === 0) {
    return (
      <div className="p-12 bg-white rounded-xl border border-slate-200 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">Sin Caducidades Críticas</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No hay productos perecederos próximos a vencer en los siguientes 20 días.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {expiringProducts.map((p) => {
        const expDate = new Date(p.expiry_date!);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isExpired = diffDays <= 0;

        return (
          <div
            key={p.id}
            className={`p-4 rounded-xl border bg-white shadow-xs flex flex-col justify-between ${
              isExpired ? 'border-rose-400 bg-rose-50/20' : 'border-amber-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2 gap-2">
                {isExpired ? (
                  <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    VENCIDO HACE {Math.abs(diffDays)} DÍAS
                  </span>
                ) : (
                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Vence en {diffDays} {diffDays === 1 ? 'día' : 'días'}
                  </span>
                )}
                <span className="font-mono text-slate-400 text-[10px] truncate">
                  {p.batch_number ? `Lote: ${p.batch_number}` : p.barcode}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>

              <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha de Vencimiento:</span>
                  <span className="font-bold font-mono text-slate-900">{p.expiry_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stock Comprometido:</span>
                  <span className="font-mono text-slate-800 tabular-nums">
                    {p.stock} {p.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pérdida Potencial:</span>
                  <span className="font-bold font-mono text-rose-700 tabular-nums">
                    ${(p.stock * p.cost_price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              {isExpired ? (
                <button
                  type="button"
                  onClick={() => onMarkWaste(p)}
                  className="min-h-[38px] flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Dar de Baja (Merma)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNavigateToInventory}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Descuento / Liquidación
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
