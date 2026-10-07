// src/components/production/RecipesView.tsx
import React from 'react';
import { Product, RecipeItem , Sale, StockMovement, CashSession, SupermarketSettings} from '../../types';
import { RecipeFormModal } from './RecipeFormModal';
import { RecipesMetrics } from './components/RecipesMetrics';
import { RecipeProductionModal } from './components/RecipeProductionModal';
import { useRecipes } from './hooks/useRecipes';
// En tu App.tsx (al inicio)
import {
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  ChefHat,
  ArrowUpDown,
  Layers
} from 'lucide-react';

interface RecipesViewProps {
  products: Product[];
  onRefreshData: () => void;
  onUpdateProductRecipe?: (
    productId: string,
    recipe: RecipeItem[],
    hasRecipe: boolean
  ) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  products,
  onRefreshData,
  onUpdateProductRecipe,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    categories,
    metrics,
    filteredRecipes,
    toggleSort,
    isFormOpen,
    setIsFormOpen,
    editingProduct,
    setEditingProduct,
    setViewingProduct,
    deletingId,
    setDeletingId,
    producingProduct,
    setProducingProduct,
    productionQty,
    setProductionQty,
    handleDeleteRecipe,
    handleExportCSV,
    handleSaveRecipe,
    handleRegisterProduction,
  } = useRecipes(products, onRefreshData, onUpdateProductRecipe);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-50">
      {/* KPIs */}
      <RecipesMetrics metrics={metrics} />

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar receta por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
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
              <span className="hidden sm:inline">Exportar</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Receta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th onClick={() => toggleSort('name')} className="py-3 px-4 cursor-pointer hover:text-slate-800">
                  <div className="flex items-center gap-1">
                    <span>Receta / Plato</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Categoría</th>
                <th onClick={() => toggleSort('cost')} className="py-3 px-3 text-right cursor-pointer hover:text-slate-800">
                  <div className="flex items-center justify-end gap-1">
                    <span>Costo Unitario</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Precio Venta</th>
                <th onClick={() => toggleSort('stock')} className="py-3 px-3 text-right cursor-pointer hover:text-slate-800">
                  <div className="flex items-center justify-end gap-1">
                    <span>Stock</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecipes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron recetas registradas.
                  </td>
                </tr>
              ) : (
                filteredRecipes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {r.recipe?.length || 0} ingredientes en receta
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {r.category || 'General'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      ${(r.cost_price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                      ${(r.sale_price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {r.stock || 0} <span className="text-[10px] text-slate-400">{r.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setProducingProduct(r);
                            setProductionQty(1);
                          }}
                          title="Registrar Producción / Elaborar"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <ChefHat className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingProduct(r)}
                          title="Ver detalles"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(r);
                            setIsFormOpen(true);
                          }}
                          title="Editar"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deletingId === r.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteRecipe(r.id)}
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
                            onClick={() => setDeletingId(r.id)}
                            title="Eliminar"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE NUEVA / EDITAR RECETA */}
      {isFormOpen && (
        <RecipeFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          products={products}
          onSave={handleSaveRecipe}
        />
      )}

      {/* MODAL DE REGISTRAR PRODUCCIÓN */}
      <RecipeProductionModal
        product={producingProduct}
        productionQty={productionQty}
        products={products} // <-- Le pasamos los productos para validar el stock
        onQtyChange={setProductionQty}
        onClose={() => setProducingProduct(null)}
        onConfirm={handleRegisterProduction}
      />
    </div>
  );
};