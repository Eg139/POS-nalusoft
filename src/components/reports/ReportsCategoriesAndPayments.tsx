import React from 'react';
import { Banknote, CreditCard, QrCode } from 'lucide-react';
import { ReportsStats } from '../../hooks/useReportsStats';

interface ReportsCategoriesAndPaymentsProps {
  stats: ReportsStats;
}

export const ReportsCategoriesAndPayments: React.FC<ReportsCategoriesAndPaymentsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">Rendimiento por Departamento</h3>
          <span className="text-xs text-slate-500">{stats.categoriesBreakdown.length} categorías</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-4">Departamento</th>
                <th className="py-2.5 px-3 text-right">Venta Total</th>
                <th className="py-2.5 px-4 text-right">Utilidad Neta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.categoriesBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    Sin datos en el período seleccionado.
                  </td>
                </tr>
              ) : (
                stats.categoriesBreakdown.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{cat.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      ${cat.revenue.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                      ${cat.profit.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-800 mb-1">Medios de Pago Recibidos</h3>
          <p className="text-xs text-slate-500 mb-4">Distribución del flujo de caja</p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs text-slate-800 truncate">Efectivo</h5>
                  <span className="text-[10px] text-slate-400">{stats.cashCount} transacciones</span>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums shrink-0">
                ${stats.cashTotal.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs text-slate-800 truncate">Tarjeta Débito/Crédito</h5>
                  <span className="text-[10px] text-slate-400">{stats.cardCount} transacciones</span>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums shrink-0">
                ${stats.cardTotal.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs text-slate-800 truncate">Transf. SPEI / QR</h5>
                  <span className="text-[10px] text-slate-400">{stats.transferCount} transacciones</span>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums shrink-0">
                ${stats.transferTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 mt-4 text-[11px] text-slate-400">
          Total facturado en período: <strong className="text-slate-800">${stats.totalRevenue.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
};
