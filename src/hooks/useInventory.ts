import { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, StockMovementType, StoreMode, HELADERIA_CATEGORIES } from '../types';
import { StorageService } from '../services/storageService';

export type InventoryTab = 'catalog' | 'flavors';
export type InventoryStatusFilter = 'all' | 'low' | 'out' | 'expiring';
export type InventorySortField = 'name' | 'stock' | 'sale_price' | 'margin';

const HELADERIA_SET = new Set<string>(HELADERIA_CATEGORIES);

export const useInventory = (
  products: Product[],
  storeMode: StoreMode,
  onRefreshData: () => void
) => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<InventoryStatusFilter>('all');
  const [sortField, setSortField] = useState<InventorySortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setCategoryFilter('Todas');
    if (storeMode === 'kiosko' && activeTab === 'flavors') {
      setActiveTab('catalog');
    }
  }, [storeMode, activeTab]);

  useEffect(() => {
    setDeletingId(null);
  }, [searchQuery, categoryFilter, statusFilter]);

  const modeProducts = useMemo(() => {
    if (storeMode === 'heladeria') {
      return products.filter((p) => !p.is_raw_flavor);
    }
    return products.filter(
      (p) =>
        !p.is_raw_flavor &&
        !p.is_icecream_presentation &&
        !p.is_supply &&
        !HELADERIA_SET.has(p.category)
    );
  }, [products, storeMode]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    modeProducts.forEach((p) => { if (p.category) set.add(p.category); });
    return ['Todas', ...Array.from(set)];
  }, [modeProducts]);

  const metrics = useMemo(() => {
    let totalCostVal = 0;
    let totalRetailVal = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringCount = 0;

    const fifteenDays = new Date();
    fifteenDays.setDate(fifteenDays.getDate() + 15);

    modeProducts.forEach((p) => {
      totalCostVal += p.stock * p.cost_price;
      totalRetailVal += p.stock * p.sale_price;
      if (p.stock <= 0) outOfStockCount++;
      else if (p.stock <= p.min_stock_alert) lowStockCount++;
      if (p.expiry_date && new Date(p.expiry_date) <= fifteenDays) expiringCount++;
    });

    const profit = Math.max(0, totalRetailVal - totalCostVal);
    return {
      totalCostVal: totalCostVal.toFixed(2),
      totalRetailVal: totalRetailVal.toFixed(2),
      avgMargin: totalRetailVal > 0 ? ((profit / totalRetailVal) * 100).toFixed(1) : '0',
      lowStockCount,
      outOfStockCount,
      expiringCount,
      totalCount: modeProducts.length,
    };
  }, [modeProducts]);

  const filteredProducts = useMemo(() => {
    const fifteenDays = new Date();
    fifteenDays.setDate(fifteenDays.getDate() + 15);
    const q = searchQuery.toLowerCase().trim();

    return modeProducts
      .filter((p) => {
        if (categoryFilter !== 'Todas' && p.category !== categoryFilter) return false;
        if (q && !p.name.toLowerCase().includes(q) && !p.barcode.includes(q) && !p.category.toLowerCase().includes(q)) {
          return false;
        }
        if (statusFilter === 'low') return p.stock > 0 && p.stock <= p.min_stock_alert;
        if (statusFilter === 'out') return p.stock <= 0;
        if (statusFilter === 'expiring') return Boolean(p.expiry_date && new Date(p.expiry_date) <= fifteenDays);
        return true;
      })
      .sort((a, b) => {
        let valA: string | number = a.name;
        let valB: string | number = b.name;
        if (sortField === 'stock') { valA = a.stock; valB = b.stock; }
        else if (sortField === 'sale_price') { valA = a.sale_price; valB = b.sale_price; }
        else if (sortField === 'margin') {
          valA = a.sale_price > 0 ? (a.sale_price - a.cost_price) / a.sale_price : 0;
          valB = b.sale_price > 0 ? (b.sale_price - b.cost_price) / b.sale_price : 0;
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [modeProducts, categoryFilter, searchQuery, statusFilter, sortField, sortAsc]);

  const toggleSort = useCallback((field: InventorySortField) => {
    setSortField((prev) => {
      if (prev === field) { setSortAsc((a) => !a); return prev; }
      setSortAsc(true);
      return field;
    });
  }, []);

  const handleSaveProduct = useCallback((prod: Product) => {
    StorageService.saveProduct(prod);
    setIsFormOpen(false);
    setEditingProduct(null);
    onRefreshData();
  }, [onRefreshData]);

  const handleDeleteProduct = useCallback((id: string) => {
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
    setAdjustingProduct(null);
    onRefreshData();
  }, [onRefreshData]);

  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Codigo_Barras', 'Nombre', 'Categoria', 'Costo', 'Precio_Venta', 'Stock', 'Min_Stock', 'Unidad', 'Tasa_IVA', 'Vencimiento', 'Lote'];
    const rows = modeProducts.map((p) => [
      p.id, `"${p.barcode}"`, `"${p.name.replace(/"/g, '""')}"`, `"${p.category}"`,
      p.cost_price, p.sale_price, p.stock, p.min_stock_alert, p.unit, p.tax_rate, p.expiry_date || '', p.batch_number || '',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `inventario-superpos-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [modeProducts]);

  return {
    activeTab, setActiveTab, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter, sortField, sortAsc, toggleSort,
    isFormOpen, setIsFormOpen, isReceiptModalOpen, setIsReceiptModalOpen,
    editingProduct, setEditingProduct, adjustingProduct, setAdjustingProduct,
    deletingId, setDeletingId, categories, metrics, filteredProducts,
    handleSaveProduct, handleDeleteProduct, handleStockAdjustment, handleExportCSV,
  };
};
