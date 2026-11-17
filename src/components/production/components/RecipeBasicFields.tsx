import React from 'react';
import { ProductUnit } from '../../../types';
import { IceCream } from 'lucide-react';

interface RecipeBasicFieldsProps {
  name: string;
  category: string;
  salePrice: number;
  unit: ProductUnit;
  isRawFlavor: boolean;
  hasRecipe: boolean;
  onNameChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onSalePriceChange: (val: number) => void;
  onUnitChange: (val: ProductUnit) => void;
  onToggleRawFlavor: (checked: boolean) => void;
  onToggleHasRecipe: (checked: boolean) => void;
}

export const RecipeBasicFields: React.FC<RecipeBasicFieldsProps> = ({
  name,
  category,
  salePrice,
  unit,
  isRawFlavor,
  hasRecipe,
  onNameChange,
  onCategoryChange,
  onSalePriceChange,
  onUnitChange,
  onToggleRawFlavor,
  onToggleHasRecipe,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50/60 border border-amber-200 p-3 sm:p-4 rounded-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
            <IceCream className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-800 text-xs sm:text-sm block">
              ¿Es un sabor de helado a granel?
            </span>
            <p className="text-[11px] sm:text-xs text-slate-600">
              Se usará en el punto de venta para armar potes y conos.
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={isRawFlavor}
            onChange={(e) => onToggleRawFlavor(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isRawFlavor ? 'Nombre del Sabor *' : 'Nombre de la Receta *'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={isRawFlavor ? 'Ej. Dulce de Leche Granizado' : 'Ej. Sándwich de Milanesa'}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
          <input
            type="text"
            value={category}
            disabled={isRawFlavor}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="Ej. Comidas, Helados"
            className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm outline-none ${
              isRawFlavor ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Precio de Venta ($)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={salePrice}
            onChange={(e) => onSalePriceChange(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono tabular-nums"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Unidad de Medida</label>
          <select
            value={unit}
            onChange={(e) => onUnitChange(e.target.value as ProductUnit)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="kg">Kilogramo (kg)</option>
            <option value="lt">Litro (lt)</option>
            <option value="pz">Pieza (pz)</option>
            <option value="gr">Gramo (gr)</option>
            <option value="ml">Mililitro (ml)</option>
            <option value="paq">Paquete (paq)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-blue-50/50 p-3 sm:p-4 rounded-lg border border-blue-100">
        <div className="min-w-0">
          <span className="font-semibold text-slate-800 text-xs sm:text-sm block">
            ¿Requiere receta de producción?
          </span>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Descuenta automáticamente las materias primas al producir.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={hasRecipe}
            onChange={(e) => onToggleHasRecipe(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
        </label>
      </div>
    </div>
  );
};
