import React, { useState } from 'react';
import { Product } from '../../types';
import { Scale, X, Check } from 'lucide-react';

interface WeightedItemModalProps {
  product: Product;
  onConfirm: (weight: number) => void;
  onClose: () => void;
}

export const WeightedItemModal: React.FC<WeightedItemModalProps> = ({
  product,
  onConfirm,
  onClose,
}) => {
  const [weightKg, setWeightKg] = useState<string>('1.000');
  const [unitMode, setUnitMode] = useState<'kg' | 'gr'>('kg');

  const parsedWeight = parseFloat(weightKg) || 0;
  const normalizedKg = unitMode === 'gr' ? parsedWeight / 1000 : parsedWeight;
  const totalPrice = normalizedKg * product.sale_price;

  const quickWeights = [
    { label: '250 g', val: 0.25 },
    { label: '500 g', val: 0.50 },
    { label: '750 g', val: 0.75 },
    { label: '1 kg', val: 1.00 },
    { label: '1.5 kg', val: 1.50 },
    { label: '2 kg', val: 2.00 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalizedKg <= 0) return;
    onConfirm(Number(normalizedKg.toFixed(3)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Báscula / Peso de Producto</h3>
              <p className="text-xs text-slate-300">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price Per Unit Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Precio por Kilogramo</span>
          <span className="text-sm font-bold text-slate-800 font-mono">${product.sale_price.toFixed(2)} / kg</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Ingresar Peso</label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => {
                    setUnitMode('kg');
                    if (unitMode === 'gr') setWeightKg((parsedWeight / 1000).toFixed(3));
                  }}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                    unitMode === 'kg' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  Kg
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUnitMode('gr');
                    if (unitMode === 'kg') setWeightKg((parsedWeight * 1000).toFixed(0));
                  }}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                    unitMode === 'gr' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  Gramos
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step={unitMode === 'kg' ? '0.005' : '5'}
                min="0.01"
                autoFocus
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full pl-4 pr-14 py-2.5 text-2xl font-bold font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                {unitMode}
              </span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="grid grid-cols-3 gap-2">
            {quickWeights.map((w) => (
              <button
                key={w.label}
                type="button"
                onClick={() => {
                  setUnitMode('kg');
                  setWeightKg(w.val.toFixed(3));
                }}
                className="px-3 py-1.5 text-xs font-medium font-mono bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 transition-colors"
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Computed Live Total */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900">
            <div>
              <span className="text-xs uppercase font-medium text-emerald-700">Subtotal Calculado</span>
              <p className="text-xs text-emerald-600 mt-0.5">
                {normalizedKg.toFixed(3)} kg × ${product.sale_price.toFixed(2)}
              </p>
            </div>
            <span className="text-2xl font-extrabold font-mono tabular-nums">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={normalizedKg <= 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              Agregar a la Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
