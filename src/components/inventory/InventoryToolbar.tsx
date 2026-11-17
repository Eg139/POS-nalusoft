import React from 'react';
import { Search, Plus, Download, ScanLine, X } from 'lucide-react';
import { InventoryStatusFilter } from '../../hooks/useInventory';

interface InventoryToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  categories: string[];
  onCategoryChange: (val: string) => void;
  statusFilter: InventoryStatusFilter;
  onStatusChange: (val: InventoryStatusFilter) => void;
  totalCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  onExportCSV: () => void;
  onOpenReceiptScanner: () => void;
  onOpenNewProduct: () => void;
}

export const InventoryToolbar: React.FC<InventoryToolbarProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  categories,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  totalCount,
  lowStockCount,
  outOfStockCount,
  expiringCount,
  onExportCSV,
  onOpenReceiptScanner,
  onOpenNewProduct,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto, insumo o código de barras..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'Todas' ? 'Todas las Categorías' : c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenReceiptScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <ScanLine className="w-4 h-4" />
            <span>Escanear Boleta IA</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewProduct}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
        <button
          type="button"
          onClick={() => onStatusChange('all')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('low')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          Stock Bajo ({lowStockCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('out')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'out' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Agotados ({outOfStockCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('expiring')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'expiring' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          Por Vencer &lt;15d ({expiringCount})
        </button>
      </div>
    </div>
  );
};
