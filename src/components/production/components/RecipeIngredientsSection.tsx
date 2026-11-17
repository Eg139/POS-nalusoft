import React from 'react';
import { Product, RecipeItem } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';

interface RecipeIngredientsSectionProps {
  availableIngredients: Product[];
  selectedIngredientId: string;
  quantity: number;
  recipeItems: RecipeItem[];
  onSelectIngredient: (id: string) => void;
  onQuantityChange: (qty: number) => void;
  onAddIngredient: () => void;
  onRemoveItem: (index: number) => void;
}

export const RecipeIngredientsSection: React.FC<RecipeIngredientsSectionProps> = ({
  availableIngredients,
  selectedIngredientId,
  quantity,
  recipeItems,
  onSelectIngredient,
  onQuantityChange,
  onAddIngredient,
  onRemoveItem,
}) => {
  return (
    <div className="space-y-3 min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
        <div className="sm:col-span-6 min-w-0">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Materia Prima / Insumo
          </label>
          <select
            value={selectedIngredientId}
            onChange={(e) => onSelectIngredient(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-slate-300 px-2.5 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Seleccionar ingrediente...</option>
            {availableIngredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name} ({ing.stock} {ing.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3 min-w-0">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Cantidad
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={quantity}
            onChange={(e) => onQuantityChange(parseFloat(e.target.value) || 0)}
            className="w-full min-w-0 rounded-lg border border-slate-300 px-2.5 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono tabular-nums"
          />
        </div>

        <div className="sm:col-span-3 min-w-0">
          <button
            type="button"
            onClick={onAddIngredient}
            className="w-full min-h-[38px] flex items-center justify-center gap-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <th className="py-2 px-3">Ingrediente / Insumo</th>
                <th className="py-2 px-3 text-right whitespace-nowrap">Cantidad</th>
                <th className="py-2 px-3 text-right whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recipeItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-slate-400">
                    No hay ingredientes agregados a esta receta todavía.
                  </td>
                </tr>
              ) : (
                recipeItems.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-800 min-w-[120px]">
                      {item.ingredient_name || 'Ingrediente'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {item.quantity_needed} {item.unit}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        aria-label="Quitar ingrediente"
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
