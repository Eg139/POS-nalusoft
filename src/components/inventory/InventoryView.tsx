import React, { useState, useMemo, useEffect } from 'react';
import { Product, StockMovementType } from '../../types';
import { StorageService } from '../../services/storageService';
import { ProductFormModal } from './ProductFormModal';
import { StockAdjustModal } from './StockAdjustModal';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Download,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  Boxes,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  onRefreshData: () => void;
  onNavigateToPOS: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out' | 'expiring'>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'stock' | 'sale_price' | 'margin'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // ✅ Sugerencia 3: Limpiar el estado de eliminación si cambian los filtros o la búsqueda
  useEffect(() => {
    setDeletingId(null);
  }, [searchQuery, categoryFilter, statusFilter]);

  // Categories list dynamically derived from catalog
  const categories: string[] = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['Todas', ...Array.from(set)];
  }, [products]);

  // Overview metrics & Unificación de fechas de referencia
  const metrics = useMemo(() => {
    let totalCostVal = 0;
    let totalRetailVal = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringCount = 0;

    const now = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(now.getDate() + 15);

    products.forEach((p) => {
      totalCostVal += p.stock * p.cost_price;
      totalRetailVal += p.stock * p.sale_price;
      if (p.stock <= 0) {
        outOfStockCount++;
      } else if (p.stock <= p.min_stock_alert) {
        lowStockCount++;
      }

      if (p.expiry_date) {
        const exp = new Date(p.expiry_date);
        if (exp <= fifteenDaysFromNow) {
          expiringCount++;
        }
      }
    });

    const potentialProfit = Math.max(0, totalRetailVal - totalCostVal);
    const avgMargin = totalRetailVal > 0 ? ((potentialProfit / totalRetailVal) * 100).toFixed(1) : '0';

    return {
      totalCostVal: totalCostVal.toFixed(2),
      totalRetailVal: totalRetailVal.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2),
      avgMargin,
      lowStockCount,
      outOfStockCount,
      expiringCount,
      totalCount: products.length,
    };
  }, [products]);

  // Filtered & Sorted products (utilizando las mismas referencias de fechas estables)
  const filteredProducts = useMemo(() => {
    const now = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(now.getDate() + 15);

    return products
      .filter((p) => {
        const matchCategory = categoryFilter === 'Todas' || p.category === categoryFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchQuery =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.category.toLowerCase().includes(q);

        let matchStatus = true;
        if (statusFilter === 'low') {
          matchStatus = p.stock > 0 && p.stock <= p.min_stock_alert;
        } else if (statusFilter === 'out') {
          matchStatus = p.stock <= 0;
        } else if (statusFilter === 'expiring') {
          if (!p.expiry_date) return false;
          matchStatus = new Date(p.expiry_date) <= fifteenDaysFromNow;
        }

        return matchCategory && matchQuery && matchStatus;
      })
      .sort((a, b) => {
        let valA: string | number = a.name;
        let valB: string | number = b.name;

        if (sortField === 'stock') {
          valA = a.stock;
          valB = b.stock;
        } else if (sortField === 'sale_price') {
          valA = a.sale_price;
          valB = b.sale_price;
        } else if (sortField === 'margin') {
          valA = a.sale_price > 0 ? (a.sale_price - a.cost_price) / a.sale_price : 0;
          valB = b.sale_price > 0 ? (b.sale_price - b.cost_price) / b.sale_price : 0;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [products, categoryFilter, searchQuery, statusFilter, sortField, sortAsc]);

  const toggleSort = (field: 'name' | 'stock' | 'sale_price' | 'margin') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSaveProduct = (prod: Product) => {
    StorageService.saveProduct(prod);
    setIsFormOpen(false);
    setEditingProduct(null);
    onRefreshData();
  };

  const handleDeleteProduct = (id: string) => {
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
    setAdjustingProduct(null);
    onRefreshData();
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Codigo_Barras',
      'Nombre',
      'Categoria',
      'Costo',
      'Precio_Venta',
      'Stock',
      'Min_Stock',
      'Unidad',
      'Tasa_IVA',
      'Fecha_Vencimiento',
      'Lote',
    ];

    const rows = products.map((p) => [
      p.id,
      `"${p.barcode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.cost_price,
      p.sale_price,
      p.stock,
      p.min_stock_alert,
      p.unit,
      p.tax_rate,
      p.expiry_date || '',
      p.batch_number || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario-materias-primas-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-50">
      {/* Top Banner KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Insumos / Stock</span>
            <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.totalCount}
            </p>
            <span className="text-[11px] text-slate-400">ítems activos</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Valor a Costo</span>
            <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ${metrics.totalCostVal}
            </p>
            <span className="text-[11px] text-slate-400">inversión en almacén</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Valor Venta Estimado</span>
            <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              ${metrics.totalRetailVal}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold">
              +{metrics.avgMargin}% margen prom.
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Alertas de Almacén</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                {metrics.lowStockCount + metrics.outOfStockCount}
              </span>
              <span className="text-xs text-rose-600 font-semibold">
                ({metrics.outOfStockCount} agotados)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">{metrics.expiringCount} por vencer pronto</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar insumo o materia prima..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'Todas' ? 'Todas las Categorías' : c}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Insumo</span>
            </button>
          </div>
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('low')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Stock Bajo ({metrics.lowStockCount})
          </button>
          <button
            onClick={() => setStatusFilter('out')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Agotados ({metrics.outOfStockCount})
          </button>
          <button
            onClick={() => setStatusFilter('expiring')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'expiring'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            Por Vencer &lt;15d ({metrics.expiringCount})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Código</th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Insumo / Producto</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-right">Costo</th>
                <th
                  onClick={() => toggleSort('sale_price')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>P. Venta</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('margin')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margen</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('stock')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Stock</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3">Vencimiento / Lote</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No se encontraron registros en el inventario.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const profitUnit = Math.max(0, p.sale_price - p.cost_price);
                  const marginPercent = p.sale_price > 0 ? ((profitUnit / p.sale_price) * 100).toFixed(1) : '0';
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.min_stock_alert;

                  let isExpiringSoon = false;
                  if (p.expiry_date) {
                    const diffDays = Math.ceil(
                      (new Date(p.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                    );
                    if (diffDays <= 15) isExpiringSoon = true;
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {p.barcode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <span>{p.name}</span>
                        {p.batch_number && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            Lote: {p.batch_number}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{p.category}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                        ${p.cost_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        ${p.sale_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                        {marginPercent}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }
                        >
                          {p.stock}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-normal">{p.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded">
                            Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded">
                            Bajo (Mín {p.min_stock_alert})
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                        {p.expiry_date ? (
                          <div
                            className={`flex items-center gap-1 ${
                              isExpiringSoon ? 'font-bold text-rose-600' : 'text-slate-600'
                            }`}
                          >
                            <span className="text-slate-400 font-normal">Vence:</span>
                            <span>{p.expiry_date}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setAdjustingProduct(p)}
                            title="Ajustar stock (Entrada/Merma)"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormOpen(true);
                            }}
                            title="Editar datos de insumo"
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {deletingId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                              >
                                ¿Borrar?
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="text-slate-400 hover:text-slate-600 text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(p.id)}
                              title="Eliminar"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories.filter((c) => c !== 'Todas')}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {adjustingProduct && (
        <StockAdjustModal
          product={adjustingProduct}
          onAdjust={handleStockAdjustment}
          onClose={() => setAdjustingProduct(null)}
        />
      )}
    </div>
  );
};