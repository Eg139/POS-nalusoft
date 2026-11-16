import React from 'react';
import { Package, IceCream } from 'lucide-react';
import { Product, ReceiptImportSummary, StoreMode } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { InventoryMetrics } from './InventoryMetrics';
import { InventoryToolbar } from './InventoryToolbar';
import { InventoryTable } from './InventoryTable';
import { IceCreamFlavorsSection } from './IceCreamFlavorsSection';
import { ProductFormModal } from './ProductFormModal';
import { StockAdjustModal } from './StockAdjustModal';
import { ReceiptScannerModal } from './receipt/ReceiptScannerModal';

interface InventoryViewProps {
  products: Product[];
  storeMode: StoreMode;
  onRefreshData: () => void;
  onNavigateToPOS: () => void;
  onNotify?: (message: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  storeMode,
  onRefreshData,
  onNavigateToPOS,
  onNotify,
}) => {
  const {
    activeTab, setActiveTab, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter, toggleSort, isFormOpen, setIsFormOpen,
    isReceiptModalOpen, setIsReceiptModalOpen, editingProduct, setEditingProduct,
    adjustingProduct, setAdjustingProduct, deletingId, setDeletingId,
    categories, metrics, filteredProducts,
    handleSaveProduct, handleDeleteProduct, handleStockAdjustment, handleExportCSV,
  } = useInventory(products, storeMode, onRefreshData);

  const handleReceiptImported = (summary: ReceiptImportSummary) => {
    setIsReceiptModalOpen(false);
    onRefreshData();
    const parts = [`+${summary.updatedCount} actualizados`, `${summary.createdCount} nuevos`];
    if (summary.recalculatedRecipesCount > 0) {
      parts.push(`${summary.recalculatedRecipesCount} recetas recalculadas`);
    }
    onNotify?.(`Boleta procesada: ${parts.join(', ')}`);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-50">
      {storeMode === 'heladeria' && (
        <div className="flex items-center gap-2 mb-4 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'catalog' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Presentaciones e Insumos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flavors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'flavors' ? 'bg-pink-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <IceCream className="w-4 h-4" />
            <span>Sabores de Helado</span>
          </button>
        </div>
      )}

      {storeMode === 'heladeria' && activeTab === 'flavors' ? (
        <IceCreamFlavorsSection
          products={products}
          onRefreshData={onRefreshData}
          onNavigateToPOS={onNavigateToPOS}
        />
      ) : (
        <>
          <InventoryMetrics {...metrics} />
          <InventoryToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            categories={categories}
            onCategoryChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            totalCount={metrics.totalCount}
            lowStockCount={metrics.lowStockCount}
            outOfStockCount={metrics.outOfStockCount}
            expiringCount={metrics.expiringCount}
            onExportCSV={handleExportCSV}
            onOpenReceiptScanner={() => setIsReceiptModalOpen(true)}
            onOpenNewProduct={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
          />
          <InventoryTable
            products={filteredProducts}
            deletingId={deletingId}
            onToggleSort={toggleSort}
            onAdjustStock={setAdjustingProduct}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsFormOpen(true);
            }}
            onRequestDelete={setDeletingId}
            onConfirmDelete={handleDeleteProduct}
          />
        </>
      )}

      {isReceiptModalOpen && (
        <ReceiptScannerModal
          products={products}
          storeMode={storeMode}
          onImported={handleReceiptImported}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}

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