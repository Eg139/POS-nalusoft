import React from 'react';
import { X, IceCream, ShoppingCart, Sparkles } from 'lucide-react';

interface StoreModeModalProps {
  currentMode: 'supermarket' | 'icecream';
  onSelectMode: (mode: 'supermarket' | 'icecream' | 'empty') => void;
  onClose: () => void;
}

export const StoreModeModal: React.FC<StoreModeModalProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h3 className="font-bold text-base">Elegir Modo de Negocio y Catálogo</h3>
            <p className="text-xs text-slate-300">Selecciona el tipo de tienda para cargar productos de ejemplo</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3.5">
          {/* Option 1: Heladería */}
          <button
            type="button"
            onClick={() => onSelectMode('icecream')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
              currentMode === 'icecream'
                ? 'border-pink-600 bg-pink-50/70 shadow-xs ring-2 ring-pink-500/20'
                : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 shadow-xs">
              <IceCream className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Modo Heladería & Gelatería Artesanal</h4>
                {currentMode === 'icecream' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                21 productos: helados por kilo/gramos a granel (con báscula integrada), conos simples y dobles,
                paletas de agua y rellenas, milkshakes y toppings.
              </p>
            </div>
          </button>

          {/* Option 2: Supermercado */}
          <button
            type="button"
            onClick={() => onSelectMode('supermarket')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
              currentMode === 'supermarket'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Modo Supermercado & Abarrotes</h4>
                {currentMode === 'supermarket' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                27 productos: abarrotes, frutas y verduras por peso, lácteos, bebidas, panadería y limpieza.
              </p>
            </div>
          </button>

          {/* Option 3: Clean state */}
          <button
            type="button"
            onClick={() => onSelectMode('empty')}
            className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-800">Empezar Catálogo Vacío (Desde Cero)</h5>
                <p className="text-[11px] text-slate-500">Limpia todos los productos demo para que cargues solo los tuyos.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 underline">Seleccionar</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};