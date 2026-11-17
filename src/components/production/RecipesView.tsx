import React from 'react';
import { Product, RecipeItem } from '../../types';
import { RecipeFormModal } from './RecipeFormModal';
import { RecipesMetrics } from './components/RecipesMetrics';
import { RecipeProductionModal } from './components/RecipeProductionModal';
import { RecipesTable } from './components/RecipesTable';
import { useRecipes } from './hooks/useRecipes';
import { Search, Plus, Download } from 'lucide-react';

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
      <RecipesMetrics metrics={metrics} />

      <div className="bg-white p-3.5 md:p-4 rounded-xl border border-slate-200 shadow-xs mb-4">
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

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'Todas' ? 'Todas las Categorías' : c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Receta</span>
            </button>
          </div>
        </div>
      </div>

      <RecipesTable
        recipes={filteredRecipes}
        deletingId={deletingId}
        onToggleSort={toggleSort}
        onProduce={(r) => {
          setProducingProduct(r);
          setProductionQty(1);
        }}
        onEdit={(r) => {
          setEditingProduct(r);
          setIsFormOpen(true);
        }}
        onRequestDelete={setDeletingId}
        onConfirmDelete={handleDeleteRecipe}
      />

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

      <RecipeProductionModal
        product={producingProduct}
        productionQty={productionQty}
        products={products}
        onQtyChange={setProductionQty}
        onClose={() => setProducingProduct(null)}
        onConfirm={handleRegisterProduction}
      />
    </div>
  );
};