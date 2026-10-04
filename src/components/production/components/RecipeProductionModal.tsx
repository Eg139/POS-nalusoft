// src/components/production/RecipeProductionModal.tsx
import React from 'react';
import { Product } from '../../../types';

interface RecipeProductionModalProps {
  product: Product | null;
  productionQty: number;
  onQtyChange: (qty: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const RecipeProductionModal: React.FC<RecipeProductionModalProps> = ({
  product,
  productionQty,
  onQtyChange,
  onClose,
  onConfirm,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col">
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
        <div className="p-6 space-y-4">
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

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <p className="font-semibold mb-1">¿Qué pasará al confirmar?</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Se sumarán <strong>{productionQty} {product.unit}</strong> al stock de esta receta.</li>
              <li>Se descontarán automáticamente las materias primas necesarias del inventario según su receta.</li>
            </ul>
          </div>
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
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Confirmar Producción
          </button>
        </div>
      </div>
    </div>
  );
};