import React from 'react';
import { Sale } from '../../types';

interface ReportsSalesTableProps {
  sales: Sale[];
  onSelectSale: (sale: Sale) => void;
}

export const ReportsSalesTable: React.FC<ReportsSalesTableProps> = ({ sales, onSelectSale }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-bold text-sm text-slate-800">Bitácora de Tickets Emitidos</h3>
        <span className="text-xs text-slate-500">
          Toca un ticket para ver detalle ({sales.length})
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="py-2.5 px-3 md:px-4">Folio</th>
              <th className="py-2.5 px-2.5 md:px-3">Fecha / Hora</th>
              <th className="hidden md:table-cell py-2.5 px-3">Cajero</th>
              <th className="py-2.5 px-2.5 md:px-3">Pago</th>
              <th className="hidden md:table-cell py-2.5 px-3 text-right">Subtotal</th>
              <th className="hidden md:table-cell py-2.5 px-3 text-right">IVA</th>
              <th className="py-2.5 px-2.5 md:px-3 text-right">Total</th>
              <th className="py-2.5 px-3 md:px-4 text-right">Ganancia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No se registran ventas para este filtro.
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectSale(s)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 md:px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {s.folio}
                  </td>
                  <td className="py-2.5 px-2.5 md:px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(s.created_at).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="hidden md:table-cell py-2.5 px-3 text-slate-700">{s.cashier_name}</td>
                  <td className="py-2.5 px-2.5 md:px-3 uppercase text-[10px] font-semibold text-slate-600 whitespace-nowrap">
                    {s.payment_method}
                  </td>
                  <td className="hidden md:table-cell py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                    ${s.subtotal.toFixed(2)}
                  </td>
                  <td className="hidden md:table-cell py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                    ${s.tax.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2.5 md:px-3 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    ${s.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 md:px-4 text-right font-mono tabular-nums font-bold text-emerald-700 whitespace-nowrap">
                    +${s.net_profit.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
