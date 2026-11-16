import React from 'react';
import { SlidersHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface IceCreamFlavorsTableProps {
  flavors: Product[];
  onAdjust: (flavor: Product) => void;
  onEdit: (flavor: Product) => void;
  onDelete: (id: string) => void;
}

export const IceCreamFlavorsTable: React.FC<IceCreamFlavorsTableProps> = ({
  flavors,
  onAdjust,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Sabor de Helado</th>
              <th className="py-3 px-3">Lote / Bacha</th>
              <th className="py-3 px-3">Fecha Fabricación</th>
              <th className="py-3 px-3">Caducidad</th>
              <th className="py-3 px-3 text-right">Costo / Kg</th>
              <th className="py-3 px-3 text-right">Venta / Kg</th>
              <th className="py-3 px-3 text-right">Stock Disponible</th>
              <th className="py-3 px-3 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flavors.map((flavor) => {
              const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');
              const isCritical = flavor.stock > 0 && flavor.stock <= flavor.min_stock_alert;
              const isOut = flavor.stock <= 0;
              return (
                <tr key={flavor.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{flavor.barcode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>🍧</span>
                      <span>{cleanName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">{flavor.batch_number || '-'}</td>
                  <td className="py-3 px-3 text-blue-700 font-semibold whitespace-nowrap">{flavor.manufacturing_date || '-'}</td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{flavor.expiry_date || '-'}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">${flavor.cost_price.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">${flavor.sale_price.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-extrabold text-sm">
                    <span className={isOut ? 'text-rose-600' : isCritical ? 'text-amber-600' : 'text-slate-900'}>
                      {flavor.stock.toFixed(1)}
                    </span>{' '}
                    <span className="text-[10px] text-slate-400 font-normal">kg</span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {isOut ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Agotado</span>
                    ) : isCritical ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Bajo</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Disponible</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => onAdjust(flavor)} title="Ajustar stock" className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded">
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onEdit(flavor)} title="Editar lote" className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onDelete(flavor.id)} title="Eliminar sabor" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
