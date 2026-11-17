import React from 'react';
import { Barcode, Search, Volume2, VolumeX, X, CornerDownLeft } from 'lucide-react';
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
  compact?: boolean;
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
  compact = false,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0 p-3 md:p-4 overflow-hidden">
      <div className="bg-white p-2.5 md:p-3.5 rounded-xl border border-slate-200 shadow-xs mb-2.5 md:mb-3 shrink-0 space-y-2">
        <form onSubmit={onBarcodeSubmit} className="flex items-center gap-2 md:gap-3">
          <div className="relative flex-1 min-w-0">
            <Barcode className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={compact ? undefined : barcodeInputRef}
              type="text"
              placeholder={compact ? 'Código o buscar...' : 'Escanear código o texto (Ej: 3*7501) [F2]'}
              value={compact ? searchQuery || barcodeInput : barcodeInput}
              onChange={(e) => {
                onBarcodeInputChange(e.target.value);
                if (compact) onSearchChange(e.target.value);
              }}
              className="w-full min-h-[44px] pl-10 pr-14 md:pr-24 py-2 text-sm font-mono bg-slate-50 focus:bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              aria-label="Buscar o agregar por código"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[36px] px-2.5 md:px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md flex items-center gap-1 transition-colors"
            >
              <span className="hidden md:inline">Enter</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {!compact && (
            <div className="relative w-52 lg:w-56 hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => onSearchChange('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-colors shrink-0 ${
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
            className={`py-1.5 px-3 rounded-md text-xs font-medium ${
              scanMessage.error
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {scanMessage.text}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1.5 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center">
            <Search className="w-10 h-10 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700 text-sm md:text-base">No se encontraron productos</p>
            <p className="text-xs md:text-sm text-slate-400 mt-1">Prueba con otro término o categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-3 pb-4">
            {filteredProducts.map((prod) => {
              const isOut = prod.stock <= 0;
              const isLow = prod.stock > 0 && prod.stock <= prod.min_stock_alert;
              return (
                <button
                  key={prod.id}
                  type="button"
                  disabled={isOut}
                  onClick={() => onAddProduct(prod)}
                  className={`min-h-[112px] text-left p-3 rounded-xl border bg-white flex flex-col justify-between transition-all duration-150 group ${
                    isOut
                      ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                      : 'border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-1.5">
                      <span className="truncate">{prod.category}</span>
                      <span
                        className={`font-mono tabular-nums shrink-0 ${
                          isOut ? 'text-rose-600 font-semibold' : isLow ? 'text-amber-700 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {isOut ? 'Agotado' : `${prod.stock} ${prod.unit}`}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-emerald-700">
                      {prod.name}
                    </h4>
                    {!compact && (
                      <div className="mb-2">
                        <ProductBadge product={prod} />
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      ${prod.sale_price.toFixed(2)}
                    </span>
                    {!compact && <span className="text-xs text-slate-400 font-mono">/{prod.unit}</span>}
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
