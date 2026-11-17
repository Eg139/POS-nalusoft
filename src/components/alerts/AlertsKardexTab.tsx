import React from 'react';
import { StockMovement, StockMovementType } from '../../types';

interface AlertsKardexTabProps {
  movements: StockMovement[];
}

const MOVEMENT_BADGES: Record<StockMovementType, { label: string; className: string }> = {
  compra: { label: 'Entrada', className: 'text-emerald-700 bg-emerald-50' },
  venta: { label: 'Venta', className: 'text-blue-700 bg-blue-50' },
  merma: { label: 'Merma', className: 'text-rose-700 bg-rose-50' },
  ajuste: { label: 'Ajuste', className: 'text-amber-700 bg-amber-50' },
  devolucion: { label: 'Devolución', className: 'text-indigo-700 bg-indigo-50' },
  produccion: { label: 'Producción', className: 'text-purple-700 bg-purple-50' },
};

export const AlertsKardexTab: React.FC<AlertsKardexTabProps> = ({ movements }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-bold text-sm text-slate-800">Kardex / Registro de Movimientos</h3>
        <span className="text-xs text-slate-500 font-mono tabular-nums">{movements.length} registros</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
              <th className="py-2.5 px-3 md:px-4">Fecha/Hora</th>
              <th className="py-2.5 px-2.5 md:px-3">Tipo</th>
              <th className="py-2.5 px-3 md:px-4">Producto</th>
              <th className="py-2.5 px-3 text-right">Cant.</th>
              <th className="hidden md:table-cell py-2.5 px-3 text-right">Stock Anterior</th>
              <th className="hidden md:table-cell py-2.5 px-3 text-right">Stock Resultante</th>
              <th className="hidden md:table-cell py-2.5 px-4">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movements.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No hay movimientos registrados aún.
                </td>
              </tr>
            ) : (
              movements.map((m) => {
                const badge = MOVEMENT_BADGES[m.type] || {
                  label: m.type,
                  className: 'text-slate-700 bg-slate-100',
                };
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 md:px-4 text-slate-500 font-mono whitespace-nowrap text-[11px]">
                      {new Date(m.created_at).toLocaleString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-2.5 md:px-3 whitespace-nowrap">
                      <span className={`${badge.className} px-2 py-0.5 rounded font-semibold text-[10px]`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 md:px-4 font-semibold text-slate-900 min-w-[110px]">
                      <span className="line-clamp-2">{m.product_name}</span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold whitespace-nowrap ${
                        m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="hidden md:table-cell py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                      {m.previous_stock}
                    </td>
                    <td className="hidden md:table-cell py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-800">
                      {m.new_stock}
                    </td>
                    <td className="hidden md:table-cell py-2.5 px-4 text-slate-600">{m.reason}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
