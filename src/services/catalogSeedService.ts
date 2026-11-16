import { CashSession, SupermarketSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_MOVEMENTS, INITIAL_CASH_SESSION, INITIAL_SETTINGS } from '../data/seedData';
import { ICE_CREAM_PRODUCTS, ICE_CREAM_SALES, ICE_CREAM_SETTINGS, ICE_CREAM_CASH_SESSION } from '../data/iceCreamData';

export const STORAGE_KEYS = {
  PRODUCTS: 'pos_products_v2',
  SALES: 'pos_sales_v2',
  MOVEMENTS: 'pos_movements_v2',
  CASH_SESSION: 'pos_cash_session_v2',
  SETTINGS: 'pos_settings_v2',
};

export const createEmptySession = (cashierName = 'Caja 01'): CashSession => ({
  id: `ses-${Date.now()}`,
  cashier_name: cashierName,
  opened_at: new Date().toISOString(),
  initial_cash: 0,
  cash_sales: 0,
  card_sales: 0,
  transfer_sales: 0,
  cash_withdrawals: 0,
  expected_cash: 0,
  status: 'abierta',
});

export function clearCatalogStorage(settings: SupermarketSettings, storeName?: string): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...settings, store_name: storeName || settings.store_name }));
  localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(createEmptySession(settings.cashier_active || 'Caja 01')));
}

export function loadKioskoCatalog(settings: SupermarketSettings): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
  localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(INITIAL_CASH_SESSION));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...settings, ...INITIAL_SETTINGS, store_mode: 'kiosko', store_name: 'Kiosco - Dock Sud' }));
}

export function loadIceCreamCatalog(settings: SupermarketSettings): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(ICE_CREAM_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(ICE_CREAM_SALES));
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CASH_SESSION, JSON.stringify(ICE_CREAM_CASH_SESSION));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...settings, ...ICE_CREAM_SETTINGS, store_mode: 'heladeria', store_name: 'Heladería Artesanal - Dock Sud' }));
}
