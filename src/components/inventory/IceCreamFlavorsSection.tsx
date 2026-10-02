import React, { useState, useMemo } from 'react';
import { Product, StockMovementType } from '../../types';
import { StorageService } from '../../services/storageService';
import { IceCreamBatchModal } from './IceCreamBatchModal';
import { StockAdjustModal } from './StockAdjustModal';
import {
  Search,
  Plus,
  Calendar,
  Tag,
  AlertTriangle,
  Scale,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  Clock
} from 'lucide-react';

interface IceCreamFlavorsSectionProps {
  products: Product[];
  onRefreshData: () => void;
  onNavigateToPOS: () => void;
}

export const IceCreamFlavorsSection: React.FC<IceCreamFlavorsSectionProps> = ({
  products,
  onRefreshData,
  onNavigateToPOS,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'critical' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal states
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<Product | null>(null);
  const [adjustingFlavor, setAdjustingFlavor] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter only raw bulk flavors
  const flavors = useMemo(() => {
    return products.filter(
      (p) =>
        p.is_raw_flavor ||
        p.category.toLowerCase().includes('sabor') ||
        p.name.toLowerCase().startsWith('sabor')
    );
  }, [products]);

  // Metrics
  const metrics = useMemo(() => {
    let totalKg = 0;
    let criticalCount = 0;
    let outCount = 0;
    let totalCost = 0;

    flavors.forEach((f) => {
      totalKg += f.stock;
      totalCost += f.stock * f.cost_price;
      if (f.stock <= 0) {
        outCount++;
      } else if (f.stock <= f.min_stock_alert) {
        criticalCount++;
      }
    });

    return {
      totalBachas: flavors.length,
      totalKg: Number(totalKg.toFixed(1)),
      criticalCount,
      outCount,
      totalCost: Number(totalCost.toFixed(2)),
    };
  }, [flavors]);

  // Filtered flavors
  const filteredFlavors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return flavors.filter((f) => {
      const matchQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.batch_number && f.batch_number.toLowerCase().includes(q)) ||
        f.barcode.includes(q);

      let matchFilter = true;
      if (filterState === 'critical') {
        matchFilter = f.stock > 0 && f.stock <= f.min_stock_alert;
      } else if (filterState === 'out') {
        matchFilter = f.stock <= 0;
      }

      return matchQuery && matchFilter;
    });
  }, [flavors, searchQuery, filterState]);

  const handleSaveFlavor = (flavorProd: Product) => {
    StorageService.saveProduct(flavorProd);
    setIsBatchModalOpen(false);
    setEditingFlavor(null);
    onRefreshData();
  };

  const handleDeleteFlavor = (id: string) => {
    StorageService.deleteProduct(id);
    setDeletingId(null);
    onRefreshData();
  };

  const handleStockAdjustment = (
    productId: string,
    delta: number,
    type: StockMovementType,
    reason: string
  ) => {
    StorageService.adjustStock(productId, delta, type, reason);
    setAdjustingFlavor(null);
    onRefreshData();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Obrador Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-pink-900">Bachas en Obrador</span>
            <p className="text-2xl font-black font-mono text-pink-700 tabular-nums">
              {metrics.totalBachas}
            </p>
            <span className="text-[11px] text-pink-600 font-medium">sabores disponibles</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl">
            🍧
          </div>
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
            <Scale className="w-5 h-5 text-slate-700" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">Inversión Obrador</span>
            <p className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
              ${metrics.totalCost.toFixed(2)}
            </p>
            <span className="text-[11px] text-emerald-600">costo de producción</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
            $
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">Estado de Bachas</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black font-mono text-amber-600 tabular-nums">
                {metrics.criticalCount}
              </span>
              <span className="text-xs text-rose-600 font-bold">
                ({metrics.outCount} agotadas)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">&lt; 3 kg para rellenar</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Bar & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por sabor, lote o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista Cuadrícula de Bachas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vitrina</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista Tabla de Trazabilidad"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
            </div>

            {/* New Batch Button */}
            <button
              onClick={() => {
                setEditingFlavor(null);
                setIsBatchModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 active:scale-98 rounded-lg transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Bacha / Sabor Elaborado</span>
            </button>
          </div>
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterState === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos los Sabores ({flavors.length})
          </button>
          <button
            onClick={() => setFilterState('critical')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterState === 'critical'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stock Crítico &lt; 3kg ({metrics.criticalCount})</span>
          </button>
          <button
            onClick={() => setFilterState('out')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterState === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span>Agotados ({metrics.outCount})</span>
          </button>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {filteredFlavors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-2xl mx-auto mb-3">
            🍧
          </div>
          <h4 className="text-sm font-bold text-slate-800">No se encontraron sabores de helado</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Registra una nueva bacha con su fecha de fabricación y lote para tener control de stock en el punto de venta.
          </p>
          <button
            onClick={() => {
              setEditingFlavor(null);
              setIsBatchModalOpen(true);
            }}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Primera Bacha</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* VISUAL BACHA GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFlavors.map((flavor) => {
            const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');
            const isCritical = flavor.stock > 0 && flavor.stock <= flavor.min_stock_alert;
            const isOut = flavor.stock <= 0;

            // Assumed full bacha capacity is 15 kg
            const maxCap = 15;
            const percentRemaining = Math.min(100, Math.round((flavor.stock / maxCap) * 100));

            // Days since manufacturing
            let daysSinceMfg: number | null = null;
            if (flavor.manufacturing_date) {
              const diffMs = new Date().getTime() - new Date(flavor.manufacturing_date).getTime();
              daysSinceMfg = Math.max(0, Math.floor(diffMs / (1000 * 3600 * 24)));
            }

            return (
              <div
                key={flavor.id}
                className={`p-4 bg-white rounded-2xl border-2 transition-all shadow-xs flex flex-col justify-between gap-3 ${
                  isOut
                    ? 'border-rose-300 bg-rose-50/20'
                    : isCritical
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 hover:border-pink-300'
                }`}
              >
                <div>
                  {/* Top Bar: Icon, Name, Batch */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">🍧</span>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {cleanName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        {flavor.batch_number ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                            Lote: {flavor.batch_number}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sin lote</span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {flavor.barcode}
                        </span>
                      </div>
                    </div>

                    {/* Stock status badge */}
                    {isOut ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                        Agotado
                      </span>
                    ) : isCritical ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Bacha Baja
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        En Existencia
                      </span>
                    )}
                  </div>

                  {/* Stock Gauge / Progress Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-slate-600">Stock en Bacha:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black font-mono text-slate-900 tabular-nums">
                          {flavor.stock.toFixed(1)}
                        </span>
                        <span className="text-xs font-bold text-slate-500 font-mono">/ 15 kg</span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOut
                            ? 'bg-rose-500 w-0'
                            : isCritical
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-pink-500 to-rose-500'
                        }`}
                        style={{ width: `${percentRemaining}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Equivale a ~{Math.floor((flavor.stock * 1000) / 160)} conos dobles</span>
                      <span className="font-mono font-bold">{percentRemaining}% capacidad</span>
                    </div>
                  </div>

                  {/* Manufacturing & Expiry Dates */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Fabricado:</span>
                      </span>
                      <span className="font-semibold text-blue-900">
                        {flavor.manufacturing_date || 'No registrada'}
                        {daysSinceMfg !== null && (
                          <span className="ml-1 text-[10px] text-slate-400 font-normal">
                            (hace {daysSinceMfg} {daysSinceMfg === 1 ? 'día' : 'días'})
                          </span>
                        )}
                      </span>
                    </div>

                    {flavor.expiry_date && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Caducidad:</span>
                        </span>
                        <span className="font-semibold text-slate-700">
                          {flavor.expiry_date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdjustingFlavor(flavor)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    title="Ajustar stock (Entrada de producción o Merma)"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Ajustar / Rellenar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingFlavor(flavor);
                      setIsBatchModalOpen(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar lote y fechas"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingId(flavor.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar sabor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Sabor de Helado</th>
                  <th className="py-3 px-3">Lote / Bacha</th>
                  <th className="py-3 px-3">Fecha Fabricación</th>
                  <th className="py-3 px-3">Caducidad</th>
                  <th className="py-3 px-3 text-right">Costo / Kg</th>
                  <th className="py-3 px-3 text-right">Venta / Kg</th>
                  <th className="py-3 px-3 text-right">Stock Disponible</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFlavors.map((flavor) => {
                  const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');
                  const isCritical = flavor.stock > 0 && flavor.stock <= flavor.min_stock_alert;
                  const isOut = flavor.stock <= 0;

                  return (
                    <tr key={flavor.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {flavor.barcode}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>🍧</span>
                          <span>{cleanName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {flavor.batch_number || '-'}
                      </td>
                      <td className="py-3 px-3 text-blue-700 font-semibold whitespace-nowrap">
                        {flavor.manufacturing_date || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {flavor.expiry_date || '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                        ${flavor.cost_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        ${flavor.sale_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-extrabold text-sm">
                        <span
                          className={
                            isOut
                              ? 'text-rose-600'
                              : isCritical
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }
                        >
                          {flavor.stock.toFixed(1)}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-normal">kg</span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            Agotado
                          </span>
                        ) : isCritical ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Bajo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Disponible
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setAdjustingFlavor(flavor)}
                            title="Ajustar stock (Entrada/Merma)"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingFlavor(flavor);
                              setIsBatchModalOpen(true);
                            }}
                            title="Editar lote y fechas"
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(flavor.id)}
                            title="Eliminar sabor"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isBatchModalOpen && (
        <IceCreamBatchModal
          flavor={editingFlavor}
          onSave={handleSaveFlavor}
          onClose={() => {
            setIsBatchModalOpen(false);
            setEditingFlavor(null);
          }}
        />
      )}

      {adjustingFlavor && (
        <StockAdjustModal
          product={adjustingFlavor}
          onConfirm={(delta, type, reason) =>
            handleStockAdjustment(adjustingFlavor.id, delta, type, reason)
          }
          onClose={() => setAdjustingFlavor(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">¿Eliminar sabor de helado?</h3>
            <p className="text-xs text-slate-500">
              Esta acción dará de baja esta bacha del catálogo y ya no aparecerá como opción en el mostrador del POS.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteFlavor(deletingId)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
