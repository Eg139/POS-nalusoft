import {
  Product, Sale, StockMovement, CashSession, SupermarketSettings,
  StockMovementType, RecipeItem, StoreMode, ReceiptReviewItem, ReceiptImportSummary,
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_MOVEMENTS, INITIAL_CASH_SESSION, INITIAL_SETTINGS } from '../data/seedData';
import { ICE_CREAM_PRODUCTS } from '../data/iceCreamData';
import { playBeep } from './audioService';
import { generateSupabaseMigrationSQL } from './supabaseSqlService';
import { processSaleTransaction } from './saleService';
import { recalculateDependentRecipes, applyRecipeToProduct, executeProductionBatch } from './recipeCostService';
import { applyReceiptBatch } from './receiptImportService';
import {
  STORAGE_KEYS, createEmptySession, clearCatalogStorage, loadKioskoCatalog, loadIceCreamCatalog,
} from './catalogSeedService';

export { playBeep };

export const StorageService = {
  getSettings(): SupermarketSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      const def = { ...INITIAL_SETTINGS, store_mode: 'kiosko' as StoreMode };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(def));
      return def;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.store_mode) {
        parsed.store_mode = 'kiosko';
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      const fallback = { ...INITIAL_SETTINGS, store_mode: 'kiosko' as StoreMode };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(fallback));
      return fallback;
    }
  },

  updateSettings(settings: SupermarketSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  setStoreMode(mode: StoreMode): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...this.getSettings(), store_mode: mode }));
  },

  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const defaultCatalog = this.getSettings().store_mode === 'heladeria' ? ICE_CREAM_PRODUCTS : INITIAL_PRODUCTS;
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultCatalog));
      return defaultCatalog;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultCatalog;
    } catch { return defaultCatalog; }
  },

  saveProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    const nowIso = new Date().toISOString();
    let updated: Product;

    if (index >= 0) {
      const previous = products[index];
      updated = { ...product, updated_at: nowIso };
      products[index] = updated;
      if (previous.stock !== product.stock) {
        this.recordStockMovement({
          product_id: product.id, product_name: product.name, barcode: product.barcode,
          type: 'ajuste', quantity: product.stock - previous.stock,
          previous_stock: previous.stock, new_stock: product.stock, reason: 'Ajuste manual de catálogo',
        });
      }
      if (previous.cost_price !== product.cost_price) {
        recalculateDependentRecipes(products, new Set([product.id]));
      }
    } else {
      updated = { ...product, id: product.id || `prod-${Date.now()}`, created_at: nowIso, updated_at: nowIso };
      products.unshift(updated);
      if (updated.stock > 0) {
        this.recordStockMovement({
          product_id: updated.id, product_name: updated.name, barcode: updated.barcode,
          type: 'compra', quantity: updated.stock, previous_stock: 0, new_stock: updated.stock,
          reason: 'Inventario inicial de producto',
        });
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return updated;
  },

  deleteProduct(id: string): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.getProducts().filter((p) => p.id !== id)));
  },

  adjustStock(productId: string, quantityDelta: number, type: StockMovementType, reason: string): Product | null {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === productId);
    if (!prod) return null;
    const prev = prod.stock;
    prod.stock = Math.max(0, Number((prev + quantityDelta).toFixed(3)));
    prod.updated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.recordStockMovement({
      product_id: prod.id, product_name: prod.name, barcode: prod.barcode,
      type, quantity: quantityDelta, previous_stock: prev, new_stock: prod.stock, reason,
    });
    return prod;
  },

  applyReceiptImport(items: ReceiptReviewItem[]): ReceiptImportSummary {
    const { products, summary } = applyReceiptBatch(this.getProducts(), items, (m) => this.recordStockMovement(m));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return summary;
  },

  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) { localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES)); return INITIAL_SALES; }
    try { return JSON.parse(raw); } catch { return INITIAL_SALES; }
  },

  recordSale(saleData: Omit<Sale, 'id' | 'folio' | 'created_at'>): Sale {
    return processSaleTransaction(saleData, {
      getProducts: () => this.getProducts(),
      saveProducts: (p) => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(p)),
      getSales: () => this.getSales(),
      saveSales: (s) => localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(s)),
      recordStockMovement: (m) => this.recordStockMovement(m),
      getCashSession: () => this.getCashSession(),
      updateCashSession: (s) => this.updateCashSession(s),
    });
  },

  getStockMovements(): StockMovement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) { localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS)); return INITIAL_MOVEMENTS; }
    try { return JSON.parse(raw); } catch { return INITIAL_MOVEMENTS; }
  },

  recordStockMovement(mov: Omit<StockMovement, 'id' | 'created_at'>): StockMovement {
    const movements = this.getStockMovements();
    const entry: StockMovement = { ...mov, id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, created_at: new Date().toISOString() };
    movements.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    return entry;
  },

  getCashSession(): CashSession {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_SESSION);
    if (!raw) { localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(INITIAL_CASH_SESSION)); return INITIAL_CASH_SESSION; }
    try { return JSON.parse(raw); } catch { return INITIAL_CASH_SESSION; }
  },

  updateCashSession(session: CashSession): void {
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(session));
  },

  openNewCashSession(cashier: string, initialCash: number): CashSession {
    const s: CashSession = { ...createEmptySession(cashier), initial_cash: initialCash, expected_cash: initialCash };
    this.updateCashSession(s);
    return s;
  },

  closeCashSession(actualCash: number): CashSession {
    const s = this.getCashSession();
    s.closed_at = new Date().toISOString();
    s.actual_cash = actualCash;
    s.difference = Number((actualCash - s.expected_cash).toFixed(2));
    s.status = 'cerrada';
    this.updateCashSession(s);
    return s;
  },

  updateIngredientPriceAndRecalculate(ingredientId: string, newCostPrice: number): void {
    const products = this.getProducts();
    const target = products.find((p) => p.id === ingredientId);
    if (target) { target.cost_price = newCostPrice; target.updated_at = new Date().toISOString(); }
    recalculateDependentRecipes(products, new Set([ingredientId]));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  updateProductRecipe(productId: string, recipe: RecipeItem[], hasRecipe: boolean): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(applyRecipeToProduct(this.getProducts(), productId, recipe, hasRecipe)));
  },

  registerProduction(productId: string, quantityProduced: number): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(executeProductionBatch(this.getProducts(), productId, quantityProduced, (m) => this.recordStockMovement(m))));
  },

  generateSupabaseMigrationSQL,

  exportDatabaseJSON(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(), version: '1.0',
      settings: this.getSettings(), products: this.getProducts(),
      sales: this.getSales(), stockMovements: this.getStockMovements(), cashSession: this.getCashSession(),
    }, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.products)) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      if (Array.isArray(data.sales)) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales));
      if (Array.isArray(data.stockMovements)) localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(data.stockMovements));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.cashSession) localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(data.cashSession));
      return true;
    } catch { return false; }
  },

  clearAllData(storeName?: string): void { clearCatalogStorage(this.getSettings(), storeName); },
  loadEmptyCatalog(storeName?: string): void { clearCatalogStorage(this.getSettings(), storeName); },
  loadSupermarketDemo(): void { loadKioskoCatalog(this.getSettings()); },
  loadIceCreamDemo(): void { loadIceCreamCatalog(this.getSettings()); },
};