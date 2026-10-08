export const HELADERIA_CATEGORIES = [
  'Sabores de Helado',
  'Presentaciones Helado',
  'Insumos y Utilidades',
  'Paletas Artesanales',
  'Toppings y Adicionales',
  'Malteadas y Bebidas',
] as const;

export const KIOSKO_CATEGORIES = [
  'Golosinas',
  'Chocolates',
  'Alfajores',
  'Galletitas',
  'Snacks',
  'Bebidas',
  'Bebidas con Alcohol',
  'Cigarrillos y Tabaco',
  'Lacteos',
  'Panaderia',
  'Helados Envasados',
  'Otros',
] as const;

export const ALL_CATEGORIES = [
...HELADERIA_CATEGORIES,
...KIOSKO_CATEGORIES,
] as const;

export type HeladeriaCategory = typeof HELADERIA_CATEGORIES[number];
export type KioskoCategory = typeof KIOSKO_CATEGORIES[number];
export type ProductCategory = typeof ALL_CATEGORIES[number] | string;

export type ProductUnit = 'pz' | 'kg' | 'lt' | 'paq' | 'gr' | 'ml';
export type StoreMode = 'heladeria' | 'kiosko';

export interface IceCreamSupplyRequirement {
  supply_product_id?: string;
  supply_name: string;
  quantity: number;
}

export interface SelectedFlavorItem {
  flavor_id: string;
  flavor_name: string;
  grams: number;
}

export interface SelectedSupplyItem {
  supply_id?: string;
  supply_name: string;
  quantity: number;
}

export interface RecipeItem {
  id?: string;
  product_id?: string;
  ingredient_id: string;
  ingredient_name?: string;
  quantity_needed: number;
  unit: ProductUnit;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  cost_price: number;
  sale_price: number;
  stock: number;
  min_stock_alert: number;
  unit: ProductUnit;
  tax_rate: number;
  expiry_date?: string;
  manufacturing_date?: string;
  batch_number?: string;
  created_at: string;
  updated_at: string;

  is_icecream_presentation?: boolean;
  max_flavors?: number;
  total_grams?: number;
  default_supplies?: IceCreamSupplyRequirement[];
  is_raw_flavor?: boolean;
  is_supply?: boolean;

  has_recipe?: boolean;
  recipe?: RecipeItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  subtotal: number;
  tax: number;
  total: number;
  profit: number;
  weight_measured?: number;
  selected_flavors?: SelectedFlavorItem[];
  selected_supplies?: SelectedSupplyItem[];
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';

export interface SaleItem {
  product_id: string;
  barcode: string;
  product_name: string;
  category: ProductCategory;
  unit: ProductUnit;
  quantity: number;
  cost_price: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  subtotal: number;
  tax: number;
  total: number;
  profit: number;
  selected_flavors?: SelectedFlavorItem[];
  selected_supplies?: SelectedSupplyItem[];
}

export interface Sale {
  id: string;
  folio: string;
  cashier_name: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  cost_total: number;
  net_profit: number;
  profit_margin: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  change: number;
  notes?: string;
  created_at: string;
}

export type StockMovementType = 'compra' | 'venta' | 'merma' | 'ajuste' | 'devolucion' | 'produccion';

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  barcode: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  created_at: string;
}

export interface CashSession {
  id: string;
  cashier_name: string;
  opened_at: string;
  closed_at?: string;
  initial_cash: number;
  cash_sales: number;
  card_sales: number;
  transfer_sales: number;
  cash_withdrawals: number;
  expected_cash: number;
  actual_cash?: number;
  difference?: number;
  status: 'abierta' | 'cerrada';
}

export interface SupermarketSettings {
  store_name: string;
  tax_id: string;
  address: string;
  phone: string;
  ticket_footer: string;
  default_tax_rate: number;
  currency: string;
  beep_enabled: boolean;
  cashier_active: string;
  store_mode: StoreMode; // <-- para no mezclar categorías
}

// Helper para no mezclar en la UI
export const getCategoriesByMode = (mode: StoreMode) => {
  return mode === 'heladeria'? HELADERIA_CATEGORIES : KIOSKO_CATEGORIES;
};