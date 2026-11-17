import React from 'react';
import { IceCream, Minus, Plus, Percent, Trash2 } from 'lucide-react';
import { CartItem } from '../../../types';

interface POSCartItemRowProps {
  item: CartItem;
  compact: boolean;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onApplyDiscount: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
}

export const POSCartItemRow: React.FC<POSCartItemRowProps> = ({
  item,
  compact,
  onUpdateQuantity,
  onApplyDiscount,
  onRemoveItem,
}) => {
  const step = item.product.unit === 'kg' ? 0.25 : 1;

  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</h5>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-mono tabular-nums">${item.unit_price.toFixed(2)}</span>
            {!compact && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-400 truncate">{item.product.barcode}</span>
              </>
            )}
            {item.discount_percent > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 font-mono">-{item.discount_percent}%</span>
            )}
          </div>

          {!compact && item.selected_flavors && item.selected_flavors.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px] text-pink-800">
              {item.selected_flavors.map((fl, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 font-medium">
                  <IceCream className="w-3 h-3 text-pink-500" />
                  <span>{fl.flavor_name} ({fl.grams}g)</span>
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="text-[15px] font-bold font-mono tabular-nums text-slate-900 shrink-0">
          ${item.total.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            onClick={() => onUpdateQuantity(item.product.id, -step)}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-white border border-slate-300 hover:bg-slate-50 flex items-center justify-center"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold font-mono tabular-nums px-2 min-w-[52px] text-center">
            {item.quantity} <span className="text-xs font-normal text-slate-500">{item.product.unit}</span>
          </span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            onClick={() => onUpdateQuantity(item.product.id, step)}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-white border border-slate-300 hover:bg-slate-50 flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onApplyDiscount(item.product.id)}
            className="min-h-[44px] px-3 text-xs font-semibold border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1"
          >
            <Percent className="w-3.5 h-3.5 text-emerald-600" />
            <span>Desc</span>
          </button>
          <button
            type="button"
            aria-label="Eliminar producto"
            onClick={() => onRemoveItem(item.product.id)}
            className="min-w-[44px] min-h-[44px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
