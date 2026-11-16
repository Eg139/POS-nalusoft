import React from 'react';
import { Search, Plus, AlertTriangle, Scale, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { Product } from '../../types';
import { useIceCreamFlavors } from '../../hooks/useIceCreamFlavors';
import { IceCreamBatchModal } from './IceCreamBatchModal';
import { StockAdjustModal } from './StockAdjustModal';
import { IceCreamFlavorCard } from './IceCreamFlavorCard';
import { IceCreamFlavorsTable } from './IceCreamFlavorsTable';

interface IceCreamFlavorsSectionProps {
  products: Product[];
  onRefreshData: () => void;
  onNavigateToPOS: () => void;
}

export const IceCreamFlavorsSection: React.FC<IceCreamFlavorsSectionProps> = ({
  products,
  onRefreshData,
}) => {
  const {
    searchQuery, setSearchQuery, filterState, setFilterState, viewMode, setViewMode,
    isBatchModalOpen, setIsBatchModalOpen, editingFlavor, setEditingFlavor,
    adjustingFlavor, setAdjustingFlavor, deletingId, setDeletingId,
    flavors, metrics, filteredFlavors,
    handleSaveFlavor, handleDeleteFlavor, handleStockAdjustment,
  } = useIceCreamFlavors(products, onRefreshData);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-pink-900">Bachas en Obrador</span>
            <p className="text-2xl font-black font-mono text-pink-700 tabular-nums">{metrics.totalBachas}</p>
            <span className="text-[11px] text-pink-600 font-medium">sabores disponibles</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl">🍧</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">Helado en Existencia</span>
            <p className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {metrics.totalKg} <span className="text-sm font-bold text-slate-500">kg</span>
            </p>
            <span className="text-[11px] text-slate-500">peso total a granel</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">Inversión Obrador</span>
            <p className="text-2xl font-black font-mono text-emerald-700 tabular-nums">${metrics.totalCost.toFixed(2)}</p>
            <span className="text-[11px] text-emerald-600">costo de producción</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">$</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">Estado de Bachas</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black font-mono text-amber-600 tabular-nums">{metrics.criticalCount}</span>
              <span className="text-xs text-rose-600 font-bold">({metrics.outCount} agotadas)</span>
            </div>
            <span className="text-[11px] text-slate-400">&lt; 3 kg para rellenar</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por sabor, lote o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vitrina</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setEditingFlavor(null); setIsBatchModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Bacha / Sabor</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <button type="button" onClick={() => setFilterState('all')} className={`px-3 py-1 text-xs font-medium rounded-lg ${filterState === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            Todos los Sabores ({flavors.length})
          </button>
          <button type="button" onClick={() => setFilterState('critical')} className={`px-3 py-1 text-xs font-medium rounded-lg ${filterState === 'critical' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'}`}>
            Stock Crítico &lt; 3kg ({metrics.criticalCount})
          </button>
          <button type="button" onClick={() => setFilterState('out')} className={`px-3 py-1 text-xs font-medium rounded-lg ${filterState === 'out' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'}`}>
            Agotados ({metrics.outCount})
          </button>
        </div>
      </div>

      {filteredFlavors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800">No se encontraron sabores de helado</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Registra una nueva bacha con su fecha de fabricación y lote para controlar stock en el POS.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFlavors.map((flavor) => (
            <IceCreamFlavorCard
              key={flavor.id}
              flavor={flavor}
              onAdjust={setAdjustingFlavor}
              onEdit={(f) => { setEditingFlavor(f); setIsBatchModalOpen(true); }}
              onDelete={setDeletingId}
            />
          ))}
        </div>
      ) : (
        <IceCreamFlavorsTable
          flavors={filteredFlavors}
          onAdjust={setAdjustingFlavor}
          onEdit={(f) => { setEditingFlavor(f); setIsBatchModalOpen(true); }}
          onDelete={setDeletingId}
        />
      )}

      {isBatchModalOpen && (
        <IceCreamBatchModal
          flavor={editingFlavor}
          onSave={handleSaveFlavor}
          onClose={() => { setIsBatchModalOpen(false); setEditingFlavor(null); }}
        />
      )}

      {adjustingFlavor && (
        <StockAdjustModal
          product={adjustingFlavor}
          onAdjust={handleStockAdjustment}
          onClose={() => setAdjustingFlavor(null)}
        />
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">¿Eliminar sabor de helado?</h3>
            <p className="text-xs text-slate-500">Esta bacha dejará de aparecer como opción en el mostrador del POS.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDeletingId(null)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="button" onClick={() => handleDeleteFlavor(deletingId)} className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
