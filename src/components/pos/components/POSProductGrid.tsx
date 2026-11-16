import React from 'react';
import { Barcode, Search, Volume2, VolumeX } from 'lucide-react';
import { Product } from '../../../types';
import { ProductBadge } from './ProductBadge';

interface POSProductGridProps {
  barcodeInput: string;
  onBarcodeInputChange: (val: string) => void;
  onBarcodeSubmit: (e: React.FormEvent) => void;
  barcodeInputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  scanMessage: { text: string; error?: boolean } | null;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  filteredProducts: Product[];
  onAddProduct: (prod: Product) => void;
}

export const POSProductGrid: React.FC<POSProductGridProps> = ({
  barcodeInput,
  onBarcodeInputChange,
  onBarcodeSubmit,
  barcodeInputRef,
  searchQuery,
  onSearchChange,
  soundEnabled,
  onToggleSound,
  scanMessage,
  categories,
  selectedCategory,
  onSelectCategory,
  filteredProducts,
  onAddProduct,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0 p-4 overflow-hidden">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm mb-3 shrink-0">
        <form onSubmit={onBarcodeSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Escanear código de barras o texto (Ej: 3*7501 o Enter) [F2]"
              value={barcodeInput}
              onChange={(e) => onBarcodeInputChange(e.target.value)}
              className="w-full pl-11 pr-28 py-2.5 text-sm font-mono bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Enter ↵
            </button>
          </div>

          <div className="relative w-56 hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
            className={`p-2.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </form>

        {scanMessage && (
          <div
            className={`mt-2 py-1.5 px-3 rounded-md text-xs font-medium ${
              scanMessage.error
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {scanMessage.text}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-thin shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center">
            <Search className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700 text-base">No se encontraron productos</p>
            <p className="text-sm text-slate-400 mt-1">Prueba con otro término o categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
            {filteredProducts.map((prod) => {
              const isOut = prod.stock <= 0;
              const isLow = prod.stock > 0 && prod.stock <= prod.min_stock_alert;
              return (
                <button
                  key={prod.id}
                  type="button"
                  disabled={isOut}
                  onClick={() => onAddProduct(prod)}
                  className={`text-left p-3 rounded-xl border bg-white flex flex-col justify-between transition-all duration-150 group ${
                    isOut
                      ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                      : 'border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-95'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="truncate max-w-[85px]">{prod.category}</span>
                      {isOut ? (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Agotado</span>
                      ) : isLow ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Stock {prod.stock}</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">{prod.stock} {prod.unit}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-emerald-700">
                      {prod.name}
                    </h4>
                    <div className="mb-2">
                      <ProductBadge product={prod} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-base font-bold text-slate-900 font-mono tabular-nums">${prod.sale_price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-mono">/{prod.unit}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
