import React from 'react';
import { Product } from '../../../types';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface RecipeProductionModalProps {
  product: Product | null;
  productionQty: number;
  products: Product[];
  onQtyChange: (qty: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const RecipeProductionModal: React.FC<RecipeProductionModalProps> = ({
  product,
  productionQty,
  products,
  onQtyChange,
  onClose,
  onConfirm,
}) => {
  if (!product) return null;

  const recipeItems = product.recipe || [];

  const ingredientStatus = recipeItems.map((item) => {
    const ingredientProduct = products.find((p) => p.id === item.ingredient_id);
    const currentStock = ingredientProduct ? ingredientProduct.stock : 0;
    const requiredTotal = item.quantity_needed * productionQty;
    const isSufficient = currentStock >= requiredTotal;

    return {
      ...item,
      currentStock,
      requiredTotal,
      isSufficient,
    };
  });

  // CORREGIDO: Se evalúa utilizando item.isSufficient
  const hasStockIssues = ingredientStatus.some((item) => !item.isSufficient);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registrar Producción</h3>
            <p className="text-xs text-slate-500">{product.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cantidad a producir ({product.unit})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.001"
              value={productionQty}
              onChange={(e) => onQtyChange(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-500" />
              Insumos que se consumirán del inventario:
            </span>

            {recipeItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border">
                Este producto no tiene una receta de ingredientes configurada.
              </p>
            ) : (
              <div className="border rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b">
                      <th className="py-2 px-3">Ingrediente</th>
                      <th className="py-2 px-3 text-right">Necesario</th>
                      <th className="py-2 px-3 text-right">Stock Actual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ingredientStatus.map((item, index) => (
                      <tr 
                        key={index} 
                        className={!item.isSufficient ? 'bg-rose-50/60' : 'hover:bg-slate-50'}
                      >
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {item.ingredient_name}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-700">
                          {item.requiredTotal.toFixed(2)} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            item.isSufficient ? 'text-emerald-700' : 'text-rose-600'
                          }`}>
                            {item.currentStock.toFixed(2)} {item.unit}
                            {!item.isSufficient && <AlertTriangle className="w-3.5 h-3.5" />}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {hasStockIssues ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Stock insuficiente</p>
                <p className="text-[11px]">No cuentas con suficiente stock en uno o más ingredientes para alcanzar la cantidad que deseas producir.</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hay suficiente stock de todos los insumos para realizar esta producción.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-6 py-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={hasStockIssues}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs ${
              hasStockIssues 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            Confirmar Producción
          </button>
        </div>

      </div>
    </div>
  );
};