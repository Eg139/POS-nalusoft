import { useState, useMemo, useCallback } from 'react';
import { Product, StockMovementType } from '../types';
import { StorageService } from '../services/storageService';

export const useIceCreamFlavors = (products: Product[], onRefreshData: () => void) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'critical' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<Product | null>(null);
  const [adjustingFlavor, setAdjustingFlavor] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const flavors = useMemo(
    () =>
      products.filter(
        (p) =>
          p.is_raw_flavor ||
          p.category.toLowerCase().includes('sabor') ||
          p.name.toLowerCase().startsWith('sabor')
      ),
    [products]
  );

  const metrics = useMemo(() => {
    let totalKg = 0;
    let criticalCount = 0;
    let outCount = 0;
    let totalCost = 0;

    flavors.forEach((f) => {
      totalKg += f.stock;
      totalCost += f.stock * f.cost_price;
      if (f.stock <= 0) outCount++;
      else if (f.stock <= f.min_stock_alert) criticalCount++;
    });

    return {
      totalBachas: flavors.length,
      totalKg: Number(totalKg.toFixed(1)),
      criticalCount,
      outCount,
      totalCost: Number(totalCost.toFixed(2)),
    };
  }, [flavors]);

  const filteredFlavors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return flavors.filter((f) => {
      const matchQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.batch_number && f.batch_number.toLowerCase().includes(q)) ||
        f.barcode.includes(q);
      if (!matchQuery) return false;
      if (filterState === 'critical') return f.stock > 0 && f.stock <= f.min_stock_alert;
      if (filterState === 'out') return f.stock <= 0;
      return true;
    });
  }, [flavors, searchQuery, filterState]);

  const handleSaveFlavor = useCallback((flavorProd: Product) => {
    StorageService.saveProduct(flavorProd);
    setIsBatchModalOpen(false);
    setEditingFlavor(null);
    onRefreshData();
  }, [onRefreshData]);

  const handleDeleteFlavor = useCallback((id: string) => {
    StorageService.deleteProduct(id);
    setDeletingId(null);
    onRefreshData();
  }, [onRefreshData]);

  const handleStockAdjustment = useCallback((
    productId: string,
    delta: number,
    type: StockMovementType,
    reason: string
  ) => {
    StorageService.adjustStock(productId, delta, type, reason);
    setAdjustingFlavor(null);
    onRefreshData();
  }, [onRefreshData]);

  return {
    searchQuery, setSearchQuery, filterState, setFilterState, viewMode, setViewMode,
    isBatchModalOpen, setIsBatchModalOpen, editingFlavor, setEditingFlavor,
    adjustingFlavor, setAdjustingFlavor, deletingId, setDeletingId,
    flavors, metrics, filteredFlavors,
    handleSaveFlavor, handleDeleteFlavor, handleStockAdjustment,
  };
};
