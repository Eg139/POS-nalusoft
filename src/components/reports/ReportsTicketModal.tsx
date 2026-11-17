import React from 'react';
import { X } from 'lucide-react';
import { Sale } from '../../types';

interface ReportsTicketModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ReportsTicketModal: React.FC<ReportsTicketModalProps> = ({ sale, onClose }) => {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <div className="min-w-0 pr-2">
            <h3 className="font-bold text-base text-slate-900">Ticket #{sale.folio}</h3>
            <p className="text-xs text-slate-400 truncate">
              {new Date(sale.created_at).toLocaleString('es-MX')} • Cajero:{' '}
              <strong className="text-slate-600">{sale.cashier_name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto mb-4 divide-y divide-slate-100">
          {sale.items.map((item, idx) => (
            <div key={idx} className="pt-2 first:pt-0 flex justify-between gap-2 text-xs">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{item.product_name}</p>
                <span className="text-[10px] text-slate-400">
                  Cant: {item.quantity} x ${item.unit_price?.toFixed(2)}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 shrink-0">${item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>${sale.subtotal.toFixed(2)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Descuento:</span>
              <span>-${sale.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>IVA:</span>
            <span>${sale.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5 text-sm">
            <span>Total:</span>
            <span>${sale.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
