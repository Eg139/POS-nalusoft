import React from 'react';
import {
  ShoppingCart, PauseCircle, PlayCircle, RotateCcw, Barcode,
  IceCream, Minus, Plus, Percent, Trash2, CreditCard,
} from 'lucide-react';
import { CartItem } from '../../../types';

interface POSCartPanelProps {
  cashierName: string;
  cart: CartItem[];
  heldCarts: CartItem[][];
  totals: { totalItems: number; subtotal: number; tax: number; total: number };
  onHoldCart: () => void;
  onRetrieveHeldCart: (idx: number) => void;
  onClearCart: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onApplyDiscount: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onOpenPayment: () => void;
}

export const POSCartPanel: React.FC<POSCartPanelProps> = ({
  cashierName,
  cart,
  heldCarts,
  totals,
  onHoldCart,
  onRetrieveHeldCart,
  onClearCart,
  onUpdateQuantity,
  onApplyDiscount,
  onRemoveItem,
  onOpenPayment,
}) => {
  return (
    <div className="w-full lg:w-[420px] lg:max-h-[calc(100vh-65px)] h-auto lg:h-[calc(100vh-65px)] min-h-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">
      <div className="px-5 py-4 bg-slate-900 text-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="font-bold text-sm leading-tight">Ticket de Venta Actual</h3>
            <p className="text-xs text-slate-400">{cashierName} · {cart.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button type="button" onClick={onHoldCart} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300">
              <PauseCircle className="w-4 h-4 text-amber-400" />
            </button>
          )}
          {heldCarts.length > 0 && (
            <div className="relative group">
              <button type="button" className="p-2 rounded-md bg-amber-500/20 text-amber-300 text-xs flex items-center gap-1 font-semibold">
                <PlayCircle className="w-4 h-4" />{heldCarts.length}
              </button>
              <div className="absolute right-0 top-full mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border py-1 hidden group-hover:block z-30">
                {heldCarts.map((hCart, idx) => (
                  <button key={idx} type="button" onClick={() => onRetrieveHeldCart(idx)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex justify-between">
                    <span>Venta #{idx + 1}</span>
                    <span className="font-mono font-bold text-emerald-600">${hCart.reduce((a, b) => a + b.total, 0).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {cart.length > 0 && (
            <button type="button" onClick={onClearCart} className="p-2 rounded-md bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5 bg-slate-50">
        {cart.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-300 mb-4 border">
              <Barcode className="w-8 h-8" />
            </div>
            <p className="font-semibold text-slate-700">El carrito está vacío</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</h5>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-mono">${item.unit_price.toFixed(2)}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-400">{item.product.barcode}</span>
                    {item.discount_percent > 0 && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">-{item.discount_percent}%</span>
                    )}
                  </div>

                  {item.selected_flavors && item.selected_flavors.length > 0 && (
                    <div className="mt-2 p-2 bg-pink-50/80 rounded-lg border border-pink-100">
                      <span className="text-[11px] font-bold text-pink-900 block mb-1">Sabores a servir:</span>
                      <div className="flex flex-wrap gap-1.5 max-h-[88px] overflow-y-auto pr-1 content-start">
                        {item.selected_flavors.map((fl, idx) => (
                          <span key={idx} className="bg-white px-2 py-1 rounded text-[11px] text-pink-900 font-medium border border-pink-200 inline-flex items-center gap-1 shrink-0">
                            <IceCream className="w-3 h-3 text-pink-500" />{fl.flavor_name} ({fl.grams}g)
                          </span>
                        ))}
                      </div>
                      {item.selected_supplies && item.selected_supplies.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-pink-200/60 flex flex-wrap gap-2 text-[11px] text-slate-600 max-h-[40px] overflow-y-auto">
                          {item.selected_supplies.map((sup, idx) => (
                            <span key={idx} className="flex items-center gap-1 shrink-0">
                              <span className="w-1 h-1 rounded-full bg-slate-400" />
                              {sup.quantity} {sup.supply_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[15px] font-bold font-mono text-slate-900">${item.total.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => onUpdateQuantity(item.product.id, item.product.unit === 'kg' ? -0.25 : -1)} className="w-7 h-7 rounded-md bg-white border border-slate-300 flex items-center justify-center">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold font-mono px-2 min-w-[40px] text-center">
                    {item.quantity} <span className="text-xs font-normal text-slate-500">{item.product.unit}</span>
                  </span>
                  <button type="button" onClick={() => onUpdateQuantity(item.product.id, item.product.unit === 'kg' ? 0.25 : 1)} className="w-7 h-7 rounded-md bg-white border border-slate-300 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => onApplyDiscount(item.product.id)} className="px-2.5 py-1.5 text-xs font-semibold border rounded-md flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-emerald-600" />Desc
                  </button>
                  <button type="button" onClick={() => onRemoveItem(item.product.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] shrink-0">
        <div className="space-y-1.5 mb-3 text-[13px] text-slate-600">
          <div className="flex justify-between"><span>Artículos:</span><span className="font-mono font-medium">{totals.totalItems}</span></div>
          <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono">${totals.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>IVA:</span><span className="font-mono">${totals.tax.toFixed(2)}</span></div>
        </div>
        <div className="flex items-end justify-between border-t pt-3 mb-3">
          <span className="font-bold text-slate-800">TOTAL</span>
          <span className="text-3xl font-black font-mono tracking-tight">${totals.total.toFixed(2)}</span>
        </div>
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={onOpenPayment}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />Cobrar Venta [F12]
        </button>
      </div>
    </div>
  );
};
