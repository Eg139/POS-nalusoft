import React from 'react';
import { SlidersHorizontal, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { Product } from '../../types';
import { InventorySortField } from '../../hooks/useInventory';

interface InventoryTableProps {
  products: Product[];
  deletingId: string | null;
  onToggleSort: (field: InventorySortField) => void;
  onAdjustStock: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onRequestDelete: (id: string | null) => void;
  onConfirmDelete: (id: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  deletingId,
  onToggleSort,
  onAdjustStock,
  onEditProduct,
  onRequestDelete,
  onConfirmDelete,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Código</th>
              <th onClick={() => onToggleSort('name')} className="py-3 px-4 cursor-pointer hover:text-slate-800">
                <div className="flex items-center gap-1">
                  <span>Producto / Insumo</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3 text-right">Costo</th>
              <th onClick={() => onToggleSort('sale_price')} className="py-3 px-3 text-right cursor-pointer hover:text-slate-800">
                <div className="flex items-center justify-end gap-1">
                  <span>P. Venta</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => onToggleSort('margin')} className="py-3 px-3 text-right cursor-pointer hover:text-slate-800">
                <div className="flex items-center justify-end gap-1" title="Ganancia sobre costo">
                  <span>Ganancia s/Costo</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => onToggleSort('stock')} className="py-3 px-3 text-right cursor-pointer hover:text-slate-800">
                <div className="flex items-center justify-end gap-1">
                  <span>Stock</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Estado</th>
              <th className="py-3 px-3">Vencimiento</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No se encontraron registros en el inventario.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const profitUnit = Math.max(0, p.sale_price - p.cost_price);
                const costProfitPercent = p.cost_price > 0 ? ((profitUnit / p.cost_price) * 100).toFixed(1) : '0';
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.min_stock_alert;
                const isExpiringSoon = p.expiry_date
                  ? Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / 86400000) <= 15
                  : false;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{p.barcode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span>{p.name}</span>
                      {p.batch_number && (
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          Lote: {p.batch_number}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{p.category}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">${p.cost_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">${p.sale_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">+{costProfitPercent}%</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                      <span className={isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-800'}>
                        {p.stock}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400 font-normal">{p.unit}</span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {isOutOfStock ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded">Agotado</span>
                      ) : isLowStock ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded">Bajo (Mín {p.min_stock_alert})</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded">Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                      {p.expiry_date ? (
                        <span className={isExpiringSoon ? 'font-bold text-rose-600' : 'text-slate-600'}>
                          Vence: {p.expiry_date}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => onAdjustStock(p)} title="Ajustar stock" className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors">
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => onEditProduct(p)} title="Editar producto" className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deletingId === p.id ? (
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => onConfirmDelete(p.id)} className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded">
                              ¿Borrar?
                            </button>
                            <button type="button" onClick={() => onRequestDelete(null)} className="text-slate-400 hover:text-slate-600 text-xs px-1">
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => onRequestDelete(p.id)} title="Eliminar" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
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
