export type ProductCategory = string;

export type ProductUnit = 'pz' | 'kg' | 'lt' | 'paq' | 'gr';

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

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  cost_price: number;       // Precio de costo / compra
  sale_price: number;       // Precio de venta al público
  stock: number;            // Stock actual
  min_stock_alert: number;  // Alerta de stock mínimo
  unit: ProductUnit;
  tax_rate: number;         // e.g. 0.16 para IVA 16% o 0 para exento
  expiry_date?: string;     // YYYY-MM-DD Fecha de vencimiento
  manufacturing_date?: string; // YYYY-MM-DD Fecha de fabricación / elaboración
  batch_number?: string;    // Número de lote / bacha
  created_at: string;
  updated_at: string;

  // Heladería Artesanal: Recetas, Sabores e Insumos
  is_icecream_presentation?: boolean; // Es un cono, vasito o pote que requiere elegir sabores
  max_flavors?: number;               // Número máximo de sabores permitidos (ej. 1, 2, 3, 4)
  total_grams?: number;               // Gramaje total de helado (ej. 80, 160, 250, 500, 1000)
  default_supplies?: IceCreamSupplyRequirement[]; // Insumos que consume (cucurucho, cucharitas, servilletas, pote)
  is_raw_flavor?: boolean;            // Es un sabor a granel en bacha (ej. Dulce de Leche, Pistacho)
  is_supply?: boolean;                // Es un insumo desechable (cucharita, servilleta, cucurucho, pote)
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;       // Puede ser modificado por descuento especial
  discount_percent: number; // 0 - 100
  subtotal: number;
  tax: number;
  total: number;
  profit: number;
  weight_measured?: number; // Para frutas/verduras pesadas
  selected_flavors?: SelectedFlavorItem[];  // Sabores seleccionados con su gramaje
  selected_supplies?: SelectedSupplyItem[]; // Utilidades e insumos a descontar
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
  profit_margin: number;    // % (net_profit / total) * 100
  payment_method: PaymentMethod;
  amount_paid: number;
  change: number;
  notes?: string;
  created_at: string;
}

export type StockMovementType = 'compra' | 'venta' | 'merma' | 'ajuste' | 'devolucion';

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  barcode: string;
  type: StockMovementType;
  quantity: number;         // positivo para entradas, negativo para salidas
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
  tax_id: string;           // RFC / RUT / CIF
  address: string;
  phone: string;
  ticket_footer: string;
  default_tax_rate: number; // e.g. 0.16
  currency: string;         // '$'
  beep_enabled: boolean;
  cashier_active: string;
}
