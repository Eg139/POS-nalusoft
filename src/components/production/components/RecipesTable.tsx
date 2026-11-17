import React from 'react';
import { Product } from '../../../types';
import { Edit2, Trash2, ChefHat, ArrowUpDown, X } from 'lucide-react';

interface RecipesTableProps {
  recipes: Product[];
  deletingId: string | null;
  onToggleSort: (field: 'name' | 'cost' | 'stock') => void;
  onProduce: (product: Product) => void;
  onEdit: (product: Product) => void;
  onRequestDelete: (id: string | null) => void;
  onConfirmDelete: (id: string) => void;
}

export const RecipesTable: React.FC<RecipesTableProps> = ({
  recipes,
  deletingId,
  onToggleSort,
  onProduce,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th onClick={() => onToggleSort('name')} className="py-3 px-3 md:px-4 cursor-pointer hover:text-slate-800">
                <div className="flex items-center gap-1">
                  <span>Receta / Plato</span>
                  <ArrowUpDown className="w-3 h-3 shrink-0" />
                </div>
              </th>
              <th className="hidden md:table-cell py-3 px-3">Categoría</th>
              <th onClick={() => onToggleSort('cost')} className="py-3 px-2.5 md:px-3 text-right cursor-pointer hover:text-slate-800">
                <div className="flex items-center justify-end gap-1">
                  <span>Costo Unit.</span>
                  <ArrowUpDown className="w-3 h-3 shrink-0" />
                </div>
              </th>
              <th className="hidden sm:table-cell py-3 px-3 text-right">Precio Venta</th>
              <th onClick={() => onToggleSort('stock')} className="py-3 px-2.5 md:px-3 text-right cursor-pointer hover:text-slate-800">
                <div className="flex items-center justify-end gap-1">
                  <span>Stock</span>
                  <ArrowUpDown className="w-3 h-3 shrink-0" />
                </div>
              </th>
              <th className="py-3 px-3 md:px-4 text-right sm:text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recipes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No se encontraron recetas registradas.
                </td>
              </tr>
            ) : (
              recipes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 md:px-4 font-semibold text-slate-900 min-w-[130px]">
                    <span className="line-clamp-2">{r.name}</span>
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                      {r.recipe?.length || 0} ingredientes
                    </span>
                  </td>
                  <td className="hidden md:table-cell py-3 px-3 text-slate-600 whitespace-nowrap">
                    {r.category || 'General'}
                  </td>
                  <td className="py-3 px-2.5 md:px-3 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    ${(r.cost_price || 0).toFixed(2)}
                  </td>
                  <td className="hidden sm:table-cell py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium whitespace-nowrap">
                    ${(r.sale_price || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2.5 md:px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                    {r.stock || 0} <span className="text-[10px] text-slate-400">{r.unit}</span>
                  </td>
                  <td className="py-2.5 px-2.5 md:px-4 whitespace-nowrap">
                    <div className="flex items-center justify-end sm:justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onProduce(r)}
                        title="Ejecutar Producción"
                        className="h-8 px-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <ChefHat className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">Producir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(r)}
                        title="Editar receta"
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {deletingId === r.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onConfirmDelete(r.id)}
                            className="px-2 h-8 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                          >
                            Borrar
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestDelete(null)}
                            aria-label="Cancelar"
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRequestDelete(r.id)}
                          title="Eliminar receta"
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
