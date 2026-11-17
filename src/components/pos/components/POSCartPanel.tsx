import React from 'react';
import { ShoppingCart, PauseCircle, PlayCircle, RotateCcw, Barcode, CreditCard } from 'lucide-react';
import { CartItem } from '../../../types';
import { POSTotals } from '../types';
import { POSCartItemRow } from './POSCartItemRow';

interface POSCartPanelProps {
  cashierName: string;
  cart: CartItem[];
  heldCarts: CartItem[][];
  totals: POSTotals;
  onHoldCart: () => void;
  onRetrieveHeldCart: (idx: number) => void;
  onClearCart: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onApplyDiscount: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onOpenPayment: () => void;
  compact?: boolean;
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
  compact = false,
}) => {
  return (
    <div
      className={
        compact
          ? 'flex-1 min-h-0 w-full bg-slate-50 flex flex-col overflow-hidden'
          : 'w-full md:w-[350px] lg:w-[410px] xl:w-[430px] h-full min-h-0 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden'
      }
    >
      <div className="px-4 py-3 bg-slate-900 text-white shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShoppingCart className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-bold text-sm leading-tight truncate">Ticket de Venta</h3>
            <p className="text-xs text-slate-400 truncate">
              {cashierName} · {cart.length} {cart.length === 1 ? 'ítem' : 'ítems'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onHoldCart}
              aria-label="Poner venta en espera"
              className="min-w-[44px] min-h-[44px] rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center"
            >
              <PauseCircle className="w-5 h-5" />
            </button>
          )}
          {heldCarts.length > 0 && (
            <div className="relative group">
              <button
                type="button"
                aria-label="Recuperar venta en espera"
                className="min-h-[44px] px-3 rounded-lg bg-amber-500/20 text-amber-300 text-xs flex items-center gap-1 font-semibold"
              >
                <PlayCircle className="w-4 h-4" />
                <span className="font-mono tabular-nums">{heldCarts.length}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-white text-slate-800 rounded-lg shadow-xl border py-1 hidden group-hover:block z-30">
                {heldCarts.map((hCart, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onRetrieveHeldCart(idx)}
                    className="w-full min-h-[44px] text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Venta #{idx + 1}</span>
                    <span className="font-mono tabular-nums font-bold text-emerald-600">
                      ${hCart.reduce((a, b) => a + b.total, 0).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              aria-label="Vaciar carrito"
              className="min-w-[44px] min-h-[44px] rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5 bg-slate-50">
        {cart.length === 0 ? (
          <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-300 mb-3 border border-slate-200">
              <Barcode className="w-7 h-7" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">El carrito está vacío</p>
          </div>
        ) : (
          cart.map((item) => (
            <POSCartItemRow
              key={item.product.id}
              item={item}
              compact={compact}
              onUpdateQuantity={onUpdateQuantity}
              onApplyDiscount={onApplyDiscount}
              onRemoveItem={onRemoveItem}
            />
          ))
        )}
      </div>

      {!compact && (
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="space-y-1 mb-3 text-[13px] text-slate-600">
            <div className="flex justify-between">
              <span>Artículos:</span>
              <span className="font-mono tabular-nums font-medium">{totals.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA:</span>
              <span className="font-mono tabular-nums">${totals.tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-end justify-between border-t border-slate-100 pt-3 mb-3">
            <span className="font-bold text-slate-800">TOTAL</span>
            <span className="text-3xl font-black font-mono tabular-nums tracking-tight">
              ${totals.total.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={onOpenPayment}
            className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span>Cobrar Venta [F12]</span>
          </button>
        </div>
      )}
    </div>
  );
};
