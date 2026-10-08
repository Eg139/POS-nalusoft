import { Product, Sale, StockMovement, CashSession, SupermarketSettings, StockMovementType, RecipeItem, StoreMode } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_MOVEMENTS, INITIAL_CASH_SESSION, INITIAL_SETTINGS } from '../data/seedData';
import { ICE_CREAM_PRODUCTS, ICE_CREAM_SALES, ICE_CREAM_SETTINGS, ICE_CREAM_CASH_SESSION } from '../data/iceCreamData';
import { INITIAL_RECIPE_PRODUCTS } from '../data/initialRecipes';

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products_v2',
  SALES: 'pos_sales_v2',
  MOVEMENTS: 'pos_movements_v2',
  CASH_SESSION: 'pos_cash_session_v2',
  SETTINGS: 'pos_settings_v2',
};

export function playBeep(type: 'scan' | 'payment' | 'error' = 'scan', enabled = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (type === 'scan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'payment') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx + 1) * 0.08);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + (idx + 1) * 0.08);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    }
  } catch {}
}

export const StorageService = {
  getSettings(): SupermarketSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      const defaultSettings = {...INITIAL_SETTINGS, store_mode: 'kiosko' as StoreMode };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.store_mode) {
        parsed.store_mode = 'kiosko';
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      const fallback = {...INITIAL_SETTINGS, store_mode: 'kiosko' as StoreMode };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(fallback));
      return fallback;
    }
  },

  updateSettings(settings: SupermarketSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const settings = this.getSettings();
    const defaultCatalog = settings.store_mode === 'heladeria'? ICE_CREAM_PRODUCTS : INITIAL_PRODUCTS;

    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultCatalog));
      return defaultCatalog;
    }
    try {
      const parsed = JSON.parse(raw);
      return parsed.length? parsed : defaultCatalog;
    } catch {
      return defaultCatalog;
    }
  },

  saveProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    let updated: Product;
    if (index >= 0) {
      const previous = products[index];
      updated = {...product, updated_at: new Date().toISOString() };
      products[index] = updated;
      if (previous.stock!== product.stock) {
        const diff = product.stock - previous.stock;
        this.recordStockMovement({
          product_id: product.id, product_name: product.name, barcode: product.barcode,
          type: 'ajuste', quantity: diff, previous_stock: previous.stock, new_stock: product.stock,
          reason: 'Ajuste manual de catálogo',
        });
      }
    } else {
      updated = {...product, id: product.id || `prod-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
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
    const products = this.getProducts().filter(p => p.id!== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  adjustStock(productId: string, quantityDelta: number, type: StockMovementType, reason: string): Product | null {
    const products = this.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return null;
    const previousStock = prod.stock;
    const newStock = Math.max(0, Number((previousStock + quantityDelta).toFixed(3)));
    prod.stock = newStock;
    prod.updated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.recordStockMovement({ product_id: prod.id, product_name: prod.name, barcode: prod.barcode, type, quantity: quantityDelta, previous_stock: previousStock, new_stock: newStock, reason });
    return prod;
  },

  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    try { return JSON.parse(raw); } catch { return INITIAL_SALES; }
  },

  recordSale(saleData: Omit<Sale, 'id' | 'folio' | 'created_at'>): Sale {
    const sales = this.getSales();
    const folioNumber = sales.length + 1001;
    const newSale: Sale = {...saleData, id: `sale-${Date.now()}`, folio: `TKT-${new Date().getFullYear()}-${String(folioNumber).padStart(4, '0')}`, created_at: new Date().toISOString() };
    sales.unshift(newSale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    const products = this.getProducts();
    for (const item of newSale.items) {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        if (!prod.is_icecream_presentation || prod.stock < 900) {
          const previousStock = prod.stock;
          const newStock = Math.max(0, Number((previousStock - item.quantity).toFixed(3)));
          prod.stock = newStock;
          prod.updated_at = new Date().toISOString();
          this.recordStockMovement({ product_id: prod.id, product_name: prod.name, barcode: prod.barcode, type: 'venta', quantity: -item.quantity, previous_stock: previousStock, new_stock: newStock, reason: `Venta Ticket ${newSale.folio}` });
        }
      }
      if (item.selected_flavors && item.selected_flavors.length > 0) {
        for (const flavorSelection of item.selected_flavors) {
          const flavorProd = products.find((p) => p.id === flavorSelection.flavor_id || p.name.toLowerCase().includes(flavorSelection.flavor_name.toLowerCase()));
          if (flavorProd) {
            const totalGramsSold = flavorSelection.grams * item.quantity;
            const deductUnits = flavorProd.unit === 'kg'? totalGramsSold / 1000 : totalGramsSold;
            const previousStock = flavorProd.stock;
            const newStock = Math.max(0, Number((previousStock - deductUnits).toFixed(3)));
            flavorProd.stock = newStock;
            flavorProd.updated_at = new Date().toISOString();
            this.recordStockMovement({ product_id: flavorProd.id, product_name: flavorProd.name, barcode: flavorProd.barcode, type: 'venta', quantity: -deductUnits, previous_stock: previousStock, new_stock: newStock, reason: `Consumo sabor (${totalGramsSold}g) en "${item.product_name}" - Ticket ${newSale.folio}` });
          }
        }
      }
      if (item.selected_supplies && item.selected_supplies.length > 0) {
        for (const supplySelection of item.selected_supplies) {
          const sName = supplySelection.supply_name.toLowerCase();
          const supplyProd = products.find((p) => {
            if (supplySelection.supply_id && p.id === supplySelection.supply_id) return true;
            const pName = p.name.toLowerCase();
            return pName.includes(sName) || sName.includes(pName);
          });
          if (supplyProd) {
            const totalQuantityDeducted = supplySelection.quantity * item.quantity;
            const previousStock = supplyProd.stock;
            const newStock = Math.max(0, Number((previousStock - totalQuantityDeducted).toFixed(3)));
            supplyProd.stock = newStock;
            supplyProd.updated_at = new Date().toISOString();
            this.recordStockMovement({ product_id: supplyProd.id, product_name: supplyProd.name, barcode: supplyProd.barcode, type: 'venta', quantity: -totalQuantityDeducted, previous_stock: previousStock, new_stock: newStock, reason: `Insumo consumido (${totalQuantityDeducted} ${supplyProd.unit}) - Ticket ${newSale.folio}` });
          }
        }
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    const session = this.getCashSession();
    if (session && session.status === 'abierta') {
      if (newSale.payment_method === 'efectivo') {
        session.cash_sales = Number((session.cash_sales + newSale.total).toFixed(2));
        session.expected_cash = Number((session.expected_cash + newSale.total).toFixed(2));
      } else if (newSale.payment_method === 'tarjeta') {
        session.card_sales = Number((session.card_sales + newSale.total).toFixed(2));
      } else if (newSale.payment_method === 'transferencia') {
        session.transfer_sales = Number((session.transfer_sales + newSale.total).toFixed(2));
      }
      this.updateCashSession(session);
    }
    return newSale;
  },

  getStockMovements(): StockMovement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    try { return JSON.parse(raw); } catch { return INITIAL_MOVEMENTS; }
  },

  recordStockMovement(mov: Omit<StockMovement, 'id' | 'created_at'>): StockMovement {
    const movements = this.getStockMovements();
    const newMovement: StockMovement = {...mov, id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, created_at: new Date().toISOString() };
    movements.unshift(newMovement);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    return newMovement;
  },

  getCashSession(): CashSession {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_SESSION);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(INITIAL_CASH_SESSION));
      return INITIAL_CASH_SESSION;
    }
    try { return JSON.parse(raw); } catch { return INITIAL_CASH_SESSION; }
  },

  updateCashSession(session: CashSession): void {
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(session));
  },

  openNewCashSession(cashier: string, initialCash: number): CashSession {
    const newSession: CashSession = { id: `ses-${Date.now()}`, cashier_name: cashier, opened_at: new Date().toISOString(), initial_cash: initialCash, cash_sales: 0, card_sales: 0, transfer_sales: 0, cash_withdrawals: 0, expected_cash: initialCash, status: 'abierta' };
    this.updateCashSession(newSession);
    return newSession;
  },

  closeCashSession(actualCash: number): CashSession {
    const session = this.getCashSession();
    session.closed_at = new Date().toISOString();
    session.actual_cash = actualCash;
    session.difference = Number((actualCash - session.expected_cash).toFixed(2));
    session.status = 'cerrada';
    this.updateCashSession(session);
    return session;
  },

  setStoreMode(mode: StoreMode): void {
    const settings = this.getSettings();
    const newSettings = {...settings, store_mode: mode };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  },

  loadEmptyCatalog(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
    const emptySession: CashSession = { id: `ses-${Date.now()}`, cashier_name: 'Caja 01', opened_at: new Date().toISOString(), initial_cash: 0, cash_sales: 0, card_sales: 0, transfer_sales: 0, cash_withdrawals: 0, expected_cash: 0, status: 'abierta' as const };
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(emptySession));
  },

  loadSupermarketDemo(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(INITIAL_CASH_SESSION));
    const newSettings = {...INITIAL_SETTINGS, store_mode: 'kiosko' as StoreMode, store_name: 'Kiosco - Dock Sud' };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  },

  loadIceCreamDemo(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(ICE_CREAM_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(ICE_CREAM_SALES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(ICE_CREAM_CASH_SESSION));
    const newSettings = {...ICE_CREAM_SETTINGS, store_mode: 'heladeria' as StoreMode, store_name: 'Heladería Artesanal - Dock Sud' };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  },

  exportDatabaseJSON(): string {
    const backup = { exportDate: new Date().toISOString(), version: '1.0', settings: this.getSettings(), products: this.getProducts(), sales: this.getSales(), stockMovements: this.getStockMovements(), cashSession: this.getCashSession() };
    return JSON.stringify(backup, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      if (data.sales && Array.isArray(data.sales)) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales));
      if (data.stockMovements && Array.isArray(data.stockMovements)) localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(data.stockMovements));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.cashSession) localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(data.cashSession));
      return true;
    } catch { return false; }
  },

  updateIngredientPriceAndRecalculate(ingredientId: string, newCostPrice: number): void {
    const products = this.getProducts();
    const targetIndex = products.findIndex(p => p.id === ingredientId);
    if (targetIndex >= 0) { products[targetIndex].cost_price = newCostPrice; products[targetIndex].updated_at = new Date().toISOString(); }
    for (const prod of products) {
      if (prod.has_recipe && prod.recipe && prod.recipe.length > 0) {
        const usesIngredient = prod.recipe.some(item => item.ingredient_id === ingredientId);
        if (usesIngredient) {
          let calculatedCost = 0;
          for (const component of prod.recipe) {
            const ingProd = products.find(p => p.id === component.ingredient_id);
            if (ingProd) calculatedCost += ingProd.cost_price * component.quantity_needed;
          }
          prod.cost_price = Number(calculatedCost.toFixed(2));
          prod.updated_at = new Date().toISOString();
        }
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  updateProductRecipe(productId: string, recipe: RecipeItem[], hasRecipe: boolean): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index >= 0) {
      let calculatedCost = 0;
      if (hasRecipe && recipe.length > 0) {
        for (const item of recipe) {
          const ing = products.find(p => p.id === item.ingredient_id);
          if (ing) calculatedCost += ing.cost_price * item.quantity_needed;
        }
      }
      const sanitizedRecipe = recipe.map(item => ({...item, ingredient_name: item.ingredient_name || 'Ingrediente' }));
      products[index] = {...products[index], recipe: sanitizedRecipe, has_recipe: hasRecipe, cost_price: hasRecipe && recipe.length > 0? Number(calculatedCost.toFixed(2)) : products[index].cost_price, updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  },

  registerProduction(productId: string, quantityProduced: number) {
    const products = this.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex < 0) return;
    const product = products[productIndex];
    const previousStock = product.stock || 0;
    const newStock = previousStock + quantityProduced;
    product.stock = Number(newStock.toFixed(3));
    product.updated_at = new Date().toISOString();
    this.recordStockMovement({ product_id: product.id, product_name: product.name, barcode: product.barcode, type: 'produccion', quantity: quantityProduced, previous_stock: previousStock, new_stock: product.stock, reason: `Producción de lote (${quantityProduced} ${product.unit || 'unidades'})` });
    if (product.has_recipe && product.recipe && product.recipe.length > 0) {
      product.recipe.forEach(item => {
        const ingredientIndex = products.findIndex(p => p.id === item.ingredient_id);
        if (ingredientIndex >= 0) {
          const ingredient = products[ingredientIndex];
          const requiredAmount = item.quantity_needed * quantityProduced;
          const prevIngStock = ingredient.stock || 0;
          const newIngStock = Math.max(0, Number((prevIngStock - requiredAmount).toFixed(3)));
          ingredient.stock = newIngStock;
          ingredient.updated_at = new Date().toISOString();
          this.recordStockMovement({ product_id: ingredient.id, product_name: ingredient.name, barcode: ingredient.barcode, type: 'produccion', quantity: -requiredAmount, previous_stock: prevIngStock, new_stock: newIngStock, reason: `Consumo por producción de "${product.name}" (Lote: ${quantityProduced})` });
        }
      });
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
};