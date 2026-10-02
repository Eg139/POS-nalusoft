import { Product, Sale, StockMovement, CashSession, SupermarketSettings, StockMovementType } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_MOVEMENTS, INITIAL_CASH_SESSION, INITIAL_SETTINGS } from '../data/seedData';
import { ICE_CREAM_PRODUCTS, ICE_CREAM_SALES, ICE_CREAM_SETTINGS, ICE_CREAM_CASH_SESSION } from '../data/iceCreamData';

const STORAGE_KEYS = {
  PRODUCTS: 'superpos_products_v1',
  SALES: 'superpos_sales_v1',
  MOVEMENTS: 'superpos_movements_v1',
  CASH_SESSION: 'superpos_cash_session_v1',
  SETTINGS: 'superpos_settings_v1',
};

// Web Audio API beep sound for POS barcode scanner
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
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // High supermarket beep
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'payment') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // Happy chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx + 1) * 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
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
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // AudioContext might be muted or not allowed prior to interaction
  }
}

export const StorageService = {
  // PRODUCTS
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let products: Product[];

    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(ICE_CREAM_PRODUCTS));
      return ICE_CREAM_PRODUCTS;
    }
    try {
      products = JSON.parse(raw);
    } catch {
      products = ICE_CREAM_PRODUCTS;
    }

    // Auto-sync generic ice cream presentations (1kg, 1/2kg, etc.) and raw flavors
    let changed = false;
    const existingIds = new Set(products.map((p) => p.id));
    const existingBarcodes = new Set(products.map((p) => p.barcode));

    // Ensure all generic presentations exist so cashier can always customize
    for (const iceProd of ICE_CREAM_PRODUCTS) {
      if (
        iceProd.is_icecream_presentation &&
        !existingIds.has(iceProd.id) &&
        !existingBarcodes.has(iceProd.barcode)
      ) {
        products.unshift(iceProd);
        existingIds.add(iceProd.id);
        existingBarcodes.add(iceProd.barcode);
        changed = true;
      }
      // Ensure raw flavors are present if catalog lacks bulk flavors
      if (
        iceProd.is_raw_flavor &&
        !existingIds.has(iceProd.id) &&
        !existingBarcodes.has(iceProd.barcode)
      ) {
        products.push(iceProd);
        existingIds.add(iceProd.id);
        existingBarcodes.add(iceProd.barcode);
        changed = true;
      }
      // Ensure supplies exist
      if (
        iceProd.is_supply &&
        !existingIds.has(iceProd.id) &&
        !existingBarcodes.has(iceProd.barcode)
      ) {
        products.push(iceProd);
        existingIds.add(iceProd.id);
        existingBarcodes.add(iceProd.barcode);
        changed = true;
      }
    }

    // Ensure flavors have manufacturing_date and proper flags
    for (const p of products) {
      const isFlavor =
        p.is_raw_flavor ||
        p.category.toLowerCase().includes('sabor') ||
        p.name.toLowerCase().startsWith('sabor');

      if (isFlavor) {
        if (!p.is_raw_flavor) {
          p.is_raw_flavor = true;
          changed = true;
        }
        if (!p.manufacturing_date) {
          p.manufacturing_date = '2026-10-01';
          changed = true;
        }
        if (!p.batch_number) {
          p.batch_number = `BACHA-${p.id.slice(-4).toUpperCase()}`;
          changed = true;
        }
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    return products;
  },

  saveProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    let updated: Product;

    if (index >= 0) {
      const previous = products[index];
      updated = {
        ...product,
        updated_at: new Date().toISOString(),
      };
      products[index] = updated;

      // Check if stock changed manually
      if (previous.stock !== product.stock) {
        const diff = product.stock - previous.stock;
        this.recordStockMovement({
          product_id: product.id,
          product_name: product.name,
          barcode: product.barcode,
          type: 'ajuste',
          quantity: diff,
          previous_stock: previous.stock,
          new_stock: product.stock,
          reason: 'Ajuste manual de catálogo',
        });
      }
    } else {
      updated = {
        ...product,
        id: product.id || `prod-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      products.unshift(updated);

      if (updated.stock > 0) {
        this.recordStockMovement({
          product_id: updated.id,
          product_name: updated.name,
          barcode: updated.barcode,
          type: 'compra',
          quantity: updated.stock,
          previous_stock: 0,
          new_stock: updated.stock,
          reason: 'Inventario inicial de producto',
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return updated;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
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

    this.recordStockMovement({
      product_id: prod.id,
      product_name: prod.name,
      barcode: prod.barcode,
      type,
      quantity: quantityDelta,
      previous_stock: previousStock,
      new_stock: newStock,
      reason,
    });

    return prod;
  },

  // SALES
  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SALES;
    }
  },

  recordSale(saleData: Omit<Sale, 'id' | 'folio' | 'created_at'>): Sale {
    const sales = this.getSales();
    const folioNumber = sales.length + 1001;
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      folio: `TKT-${new Date().getFullYear()}-${String(folioNumber).padStart(4, '0')}`,
      created_at: new Date().toISOString(),
    };

    sales.unshift(newSale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    // Deduct stock for each sold item and its recipe components (flavors & supplies)
    const products = this.getProducts();

    for (const item of newSale.items) {
      // 1. Deduct the sold product itself (if not virtual presentation with stock 999)
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        if (!prod.is_icecream_presentation || prod.stock < 900) {
          const previousStock = prod.stock;
          const newStock = Math.max(0, Number((previousStock - item.quantity).toFixed(3)));
          prod.stock = newStock;
          prod.updated_at = new Date().toISOString();

          this.recordStockMovement({
            product_id: prod.id,
            product_name: prod.name,
            barcode: prod.barcode,
            type: 'venta',
            quantity: -item.quantity,
            previous_stock: previousStock,
            new_stock: newStock,
            reason: `Venta Ticket ${newSale.folio}`,
          });
        }
      }

      // 2. Deduct selected ice cream flavors (by exact grams)
      if (item.selected_flavors && item.selected_flavors.length > 0) {
        for (const flavorSelection of item.selected_flavors) {
          const flavorProd = products.find(
            (p) =>
              p.id === flavorSelection.flavor_id ||
              p.name.toLowerCase().includes(flavorSelection.flavor_name.toLowerCase())
          );

          if (flavorProd) {
            const totalGramsSold = flavorSelection.grams * item.quantity;
            // Convert to kg if flavor is measured in kg
            const deductUnits =
              flavorProd.unit === 'kg'
                ? totalGramsSold / 1000
                : totalGramsSold;

            const previousStock = flavorProd.stock;
            const newStock = Math.max(0, Number((previousStock - deductUnits).toFixed(3)));
            flavorProd.stock = newStock;
            flavorProd.updated_at = new Date().toISOString();

            this.recordStockMovement({
              product_id: flavorProd.id,
              product_name: flavorProd.name,
              barcode: flavorProd.barcode,
              type: 'venta',
              quantity: -deductUnits,
              previous_stock: previousStock,
              new_stock: newStock,
              reason: `Consumo sabor (${totalGramsSold}g) en "${item.product_name}" - Ticket ${newSale.folio}`,
            });
          }
        }
      }

      // 3. Deduct packaging supplies and utilities (cucuruchos, cucharitas, servilletas, potes)
      if (item.selected_supplies && item.selected_supplies.length > 0) {
        for (const supplySelection of item.selected_supplies) {
          const sName = supplySelection.supply_name.toLowerCase();
          const supplyProd = products.find((p) => {
            if (supplySelection.supply_id && p.id === supplySelection.supply_id) return true;
            const pName = p.name.toLowerCase();
            if (pName === sName) return true;
            if (pName.includes(sName) || sName.includes(pName)) return true;
            // Keyword fuzzy match for common ice cream supplies
            if (sName.includes('cucharita') && pName.includes('cucharita')) return true;
            if (sName.includes('servilleta') && pName.includes('servilleta')) return true;
            if (sName.includes('cucurucho') && pName.includes('cucurucho')) return true;
            if (sName.includes('waffle') && pName.includes('waffle')) return true;
            if (sName.includes('250') && pName.includes('250')) return true;
            if (sName.includes('500') && pName.includes('500')) return true;
            if (
              (sName.includes('1 kg') || sName.includes('1kg')) &&
              (pName.includes('1 kg') || pName.includes('1kg'))
            )
              return true;
            return false;
          });

          if (supplyProd) {
            const totalQuantityDeducted = supplySelection.quantity * item.quantity;
            const previousStock = supplyProd.stock;
            const newStock = Math.max(0, Number((previousStock - totalQuantityDeducted).toFixed(3)));
            supplyProd.stock = newStock;
            supplyProd.updated_at = new Date().toISOString();

            this.recordStockMovement({
              product_id: supplyProd.id,
              product_name: supplyProd.name,
              barcode: supplyProd.barcode,
              type: 'venta',
              quantity: -totalQuantityDeducted,
              previous_stock: previousStock,
              new_stock: newStock,
              reason: `Insumo consumido (${totalQuantityDeducted} ${supplyProd.unit}) en "${item.product_name}" - Ticket ${newSale.folio}`,
            });
          }
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Update Cash Session if active
    const session = this.getCashSession();
    if (session && session.status === 'abierta') {
      if (newSale.payment_method === 'efectivo') {
        session.cash_sales = Number((session.cash_sales + newSale.total).toFixed(2));
        session.expected_cash = Number((session.expected_cash + newSale.total).toFixed(2));
      } else if (newSale.payment_method === 'tarjeta') {
        session.card_sales = Number((session.card_sales + newSale.total).toFixed(2));
      } else if (newSale.payment_method === 'transferencia') {
        session.transfer_sales = Number((session.transfer_sales + newSale.total).toFixed(2));
      } else if (newSale.payment_method === 'mixto') {
        // Assume split half or based on amount
        session.cash_sales = Number((session.cash_sales + (newSale.amount_paid - newSale.change)).toFixed(2));
      }
      this.updateCashSession(session);
    }

    return newSale;
  },

  // STOCK MOVEMENTS
  getStockMovements(): StockMovement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOVEMENTS;
    }
  },

  recordStockMovement(mov: Omit<StockMovement, 'id' | 'created_at'>): StockMovement {
    const movements = this.getStockMovements();
    const newMovement: StockMovement = {
      ...mov,
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    movements.unshift(newMovement);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    return newMovement;
  },

  // CASH SESSION (ARQUEO DE CAJA)
  getCashSession(): CashSession {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_SESSION);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(INITIAL_CASH_SESSION));
      return INITIAL_CASH_SESSION;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CASH_SESSION;
    }
  },

  updateCashSession(session: CashSession): void {
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(session));
  },

  openNewCashSession(cashier: string, initialCash: number): CashSession {
    const newSession: CashSession = {
      id: `ses-${Date.now()}`,
      cashier_name: cashier,
      opened_at: new Date().toISOString(),
      initial_cash: initialCash,
      cash_sales: 0,
      card_sales: 0,
      transfer_sales: 0,
      cash_withdrawals: 0,
      expected_cash: initialCash,
      status: 'abierta',
    };
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

  // SETTINGS
  getSettings(): SupermarketSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  updateSettings(settings: SupermarketSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // RESET / BACKUP / RESTORE
  resetToDemoData(): void {
    this.loadSupermarketDemo();
  },

  loadSupermarketDemo(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(INITIAL_CASH_SESSION));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  },

  loadIceCreamDemo(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(ICE_CREAM_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(ICE_CREAM_SALES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(ICE_CREAM_CASH_SESSION));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(ICE_CREAM_SETTINGS));
  },

  clearAllData(storeName = 'Mi Heladería Artesanal'): void {
    const blankSettings: SupermarketSettings = {
      store_name: storeName,
      tax_id: 'RFC-HEL-001',
      address: 'Sucursal Principal',
      phone: '',
      ticket_footer: '¡Gracias por su compra!',
      default_tax_rate: 0.16,
      currency: '$',
      beep_enabled: true,
      cashier_active: 'Cajero 01',
    };
    const blankSession: CashSession = {
      id: `ses-${Date.now()}`,
      cashier_name: 'Cajero 01',
      opened_at: new Date().toISOString(),
      initial_cash: 500,
      cash_sales: 0,
      card_sales: 0,
      transfer_sales: 0,
      cash_withdrawals: 0,
      expected_cash: 500,
      status: 'abierta',
    };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(blankSession));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(blankSettings));
  },

  exportDatabaseJSON(): string {
    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      settings: this.getSettings(),
      products: this.getProducts(),
      sales: this.getSales(),
      stockMovements: this.getStockMovements(),
      cashSession: this.getCashSession(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      }
      if (data.sales && Array.isArray(data.sales)) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales));
      }
      if (data.stockMovements && Array.isArray(data.stockMovements)) {
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(data.stockMovements));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      if (data.cashSession) {
        localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(data.cashSession));
      }
      return true;
    } catch {
      return false;
    }
  },

  // SUPABASE MIGRATION GENERATOR
  generateSupabaseMigrationSQL(): string {
    const products = this.getProducts();
    const sales = this.getSales();

    let sql = `-- ============================================================
-- ESQUEMA COMPLETO PARA SUPABASE / POSTGRESQL (SUPERPOS)
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    barcode VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock NUMERIC(12, 3) NOT NULL DEFAULT 0,
    min_stock_alert NUMERIC(12, 3) NOT NULL DEFAULT 5,
    unit VARCHAR(20) NOT NULL DEFAULT 'pz',
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0,
    expiry_date DATE,
    batch_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda veloz de caja
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock_alert ON products(stock, min_stock_alert);

-- 2. TABLA DE VENTAS
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    cashier_name VARCHAR(150) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cost_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    profit_margin NUMERIC(6, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    change NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

-- 3. DETALLE DE VENTAS
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    barcode VARCHAR(64),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20),
    quantity NUMERIC(12, 3) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 4) DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    profit NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MOVIMIENTOS DE KARDEX (STOCK)
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(64),
    type VARCHAR(30) NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL,
    previous_stock NUMERIC(12, 3) NOT NULL,
    new_stock NUMERIC(12, 3) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SESIONES DE CAJA (ARQUEOS)
CREATE TABLE IF NOT EXISTS cash_sessions (
    id TEXT PRIMARY KEY,
    cashier_name VARCHAR(150) NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    initial_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cash_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
    card_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
    transfer_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cash_withdrawals NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expected_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
    actual_cash NUMERIC(12, 2),
    difference NUMERIC(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'abierta'
);

-- RLS (Row Level Security) - Activar y permitir acceso autenticado / anon
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura general a productos" ON products FOR SELECT USING (true);
CREATE POLICY "Permitir escritura general a productos" ON products FOR ALL USING (true);

CREATE POLICY "Permitir todo en ventas" ON sales FOR ALL USING (true);
CREATE POLICY "Permitir todo en sale_items" ON sale_items FOR ALL USING (true);
CREATE POLICY "Permitir todo en movimientos" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Permitir todo en sesiones de caja" ON cash_sessions FOR ALL USING (true);

-- ============================================================
-- INSERCIÓN DE DATOS ACTUALES (MIGRACIÓN DESDE TU DEMO LOCAL)
-- ============================================================
`;

    // Add Products Inserts
    if (products.length > 0) {
      sql += `\n-- Insertar catálogo de productos actual (${products.length} productos)\n`;
      sql += `INSERT INTO products (id, barcode, name, category, cost_price, sale_price, stock, min_stock_alert, unit, tax_rate, expiry_date, batch_number, created_at, updated_at)\nVALUES\n`;
      const prodRows = products.map(p => {
        const exp = p.expiry_date ? `'${p.expiry_date}'` : 'NULL';
        const batch = p.batch_number ? `'${p.batch_number.replace(/'/g, "''")}'` : 'NULL';
        const name = p.name.replace(/'/g, "''");
        return `  ('${p.id}', '${p.barcode}', '${name}', '${p.category}', ${p.cost_price}, ${p.sale_price}, ${p.stock}, ${p.min_stock_alert}, '${p.unit}', ${p.tax_rate}, ${exp}, ${batch}, '${p.created_at}', '${p.updated_at}')`;
      });
      sql += prodRows.join(',\n') + '\nON CONFLICT (barcode) DO UPDATE SET stock = EXCLUDED.stock, sale_price = EXCLUDED.sale_price;\n';
    }

    // Add Sales Inserts
    if (sales.length > 0) {
      sql += `\n-- Insertar historial de ventas actual (${sales.length} ventas)\n`;
      for (const s of sales) {
        sql += `INSERT INTO sales (id, folio, cashier_name, subtotal, discount, tax, total, cost_total, net_profit, profit_margin, payment_method, amount_paid, change, notes, created_at)
VALUES ('${s.id}', '${s.folio}', '${s.cashier_name.replace(/'/g, "''")}', ${s.subtotal}, ${s.discount}, ${s.tax}, ${s.total}, ${s.cost_total}, ${s.net_profit}, ${s.profit_margin}, '${s.payment_method}', ${s.amount_paid}, ${s.change}, ${s.notes ? `'${s.notes.replace(/'/g, "''")}'` : 'NULL'}, '${s.created_at}')
ON CONFLICT (id) DO NOTHING;\n`;

        for (const item of s.items) {
          sql += `INSERT INTO sale_items (sale_id, product_id, barcode, product_name, category, unit, quantity, cost_price, unit_price, discount_percent, tax_rate, subtotal, tax, total, profit, created_at)
VALUES ('${s.id}', '${item.product_id}', '${item.barcode}', '${item.product_name.replace(/'/g, "''")}', '${item.category}', '${item.unit}', ${item.quantity}, ${item.cost_price}, ${item.unit_price}, ${item.discount_percent}, ${item.tax_rate}, ${item.subtotal}, ${item.tax}, ${item.total}, ${item.profit}, '${s.created_at}');\n`;
        }
      }
    }

    sql += `\n-- Migración completada con éxito. Conecta tu frontend con @supabase/supabase-js usando createClient(SUPABASE_URL, SUPABASE_ANON_KEY).\n`;

    return sql;
  }
};
