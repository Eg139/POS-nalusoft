import React from 'react';
import { Plus, Trash2, CheckCircle2, PackagePlus } from 'lucide-react';
import { ReceiptReviewItem } from '../../../types';

interface ReceiptReviewTableProps {
  items: ReceiptReviewItem[];
  onUpdateRow: <K extends keyof ReceiptReviewItem>(
    tempId: string,
    field: K,
    value: ReceiptReviewItem[K]
  ) => void;
  onRemoveRow: (tempId: string) => void;
  onAddRow: () => void;
  onToggleAll: (checked: boolean) => void;
}

export const ReceiptReviewTable: React.FC<ReceiptReviewTableProps> = ({
  items,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
  onToggleAll,
}) => {
  const selectedItems = items.filter((i) => i.selected && i.name.trim().length > 0);
  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const totalCost = selectedItems.reduce((acc, row) => acc + row.quantity * row.cost_price, 0);

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-200 rounded-xl px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Revisa y corrige los datos extraídos antes de impactar el inventario.{' '}
            <strong>{selectedItems.length}</strong> de {items.length} ítems seleccionados.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-slate-900">
            Total Boleta: ${totalCost.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={onAddRow}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Fila</span>
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[380px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3 text-center w-9">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-3 min-w-[115px]">Código / Barcode</th>
              <th className="py-2.5 px-3 min-w-[190px]">Producto</th>
              <th className="py-2.5 px-3 w-24 text-right">Cantidad</th>
              <th className="py-2.5 px-3 w-28 text-right">Costo Unit.</th>
              <th className="py-2.5 px-3 w-28 text-right">P. Venta (Nuevo)</th>
              <th className="py-2.5 px-3 w-10 text-center">Quitar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((row) => {
              const isMatched = Boolean(row.matchedProductId);
              return (
                <tr key={row.tempId} className={row.selected ? 'hover:bg-slate-50/70' : 'opacity-50 bg-slate-50'}>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={(e) => onUpdateRow(row.tempId, 'selected', e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {isMatched ? (
                      <span
                        title={`Actualiza "${row.matchedProductName}" (Stock actual: ${row.currentStock})`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                      >
                        + Stock ({row.currentStock ?? 0})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        <PackagePlus className="w-3 h-3" />
                        Nuevo
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={row.barcode}
                      placeholder="Sin código"
                      onChange={(e) => onUpdateRow(row.tempId, 'barcode', e.target.value)}
                      className="w-full px-2 py-1 font-mono bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={row.name}
                      placeholder="Nombre del producto"
                      onChange={(e) => onUpdateRow(row.tempId, 'name', e.target.value)}
                      className="w-full px-2 py-1 font-semibold bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      value={row.quantity}
                      onChange={(e) => onUpdateRow(row.tempId, 'quantity', Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2 py-1 text-right font-mono font-bold bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.cost_price}
                      onChange={(e) => onUpdateRow(row.tempId, 'cost_price', Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2 py-1 text-right font-mono bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    {isMatched ? (
                      <span className="block text-right font-mono text-slate-400 px-2">
                        ${row.sale_price.toFixed(2)}
                      </span>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.sale_price}
                        onChange={(e) => onUpdateRow(row.tempId, 'sale_price', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 text-right font-mono font-semibold bg-blue-50/40 border border-blue-200 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(row.tempId)}
                      title="Eliminar fila"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
