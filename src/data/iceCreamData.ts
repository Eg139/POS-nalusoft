import { Product, Sale, SupermarketSettings, CashSession } from '../types';

export const ICE_CREAM_SETTINGS: SupermarketSettings = {
  store_name: 'Kiosco & Heladería - Dock Sud',
  store_mode: 'heladeria',
  tax_id: '30-71234567-9',
  address: 'Av. Mitre 2550, Dock Sud, Avellaneda - BA',
  phone: '+54 11 4222-8899',
  ticket_footer: '¡Gracias por tu compra! Helado artesanal 100% argentino.',
  default_tax_rate: 0.21,
  currency: '$',
  beep_enabled: true,
  cashier_active: 'Caja 01',
};

export const ICE_CREAM_PRODUCTS: Product[] = [
  {
    id: 'hel-pres-01', barcode: '750900010001', name: 'Cono Simple (1 Sabor)', category: 'Presentaciones Helado',
    cost_price: 800, sale_price: 2500, stock: 999, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21,
    is_icecream_presentation: true, max_flavors: 1, total_grams: 80,
    default_supplies: [{ supply_name: 'Cucurucho Dulce Tradicional', quantity: 1 }, { supply_name: 'Servilletas de Papel', quantity: 1 }],
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'hel-pres-02', barcode: '750900010002', name: 'Cono Doble (Hasta 2 Sabores)', category: 'Presentaciones Helado',
    cost_price: 1400, sale_price: 3800, stock: 999, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21,
    is_icecream_presentation: true, max_flavors: 2, total_grams: 160,
    default_supplies: [{ supply_name: 'Cono Waffle Artesanal', quantity: 1 }, { supply_name: 'Cucharitas Plásticas', quantity: 1 }, { supply_name: 'Servilletas de Papel', quantity: 1 }],
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'hel-pres-03', barcode: '750900010003', name: 'Vasito Chico (Hasta 2 Sabores)', category: 'Presentaciones Helado',
    cost_price: 900, sale_price: 3200, stock: 999, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21,
    is_icecream_presentation: true, max_flavors: 2, total_grams: 120,
    default_supplies: [{ supply_name: 'Vasito Térmico Chico', quantity: 1 }, { supply_name: 'Cucharitas Plásticas', quantity: 1 }, { supply_name: 'Servilletas de Papel', quantity: 1 }],
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'hel-pres-04', barcode: '750900010004', name: 'Vasito Mediano (Hasta 3 Sabores)', category: 'Presentaciones Helado',
    cost_price: 1200, sale_price: 4200, stock: 999, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21,
    is_icecream_presentation: true, max_flavors: 3, total_grams: 180,
    default_supplies: [{ supply_name: 'Vasito Térmico Mediano', quantity: 1 }, { supply_name: 'Cucharitas Plásticas', quantity: 1 }, { supply_name: 'Servilletas de Papel', quantity: 1 }],
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'hel-pres-05', barcode: '750900010005', name: 'Pote 1/4 Kg (Hasta 3 Sabores)', category: 'Presentaciones Helado',
    cost_price: 2200, sale_price: 5500, stock: 999, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21,
    is_icecream_presentation: true, max_flavors: 3, total_grams: 250,
    default_supplies: [{ supply_name: 'Pote Térmico 250g', quantity: 1 }, { supply_name: 'Cucharitas Plásticas', quantity: 2 }, { supply_name: 'Servilletas de Papel', quantity: 2 }],
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'hel-pres-06', barcode: '750900010006', name: 'Pote 1/2 Kg (Hasta 3 Sabores)', category: 'Presentaciones Helado',
    cost_price: 3800, sale_price: 9500, stock: 999, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21,
    is_icecream_presentation: true, max_flavors: 3, total_grams: 500,
    default_supplies: [{ supply_name: 'Pote Térmico 500g', quantity: 1 }, { supply_name: 'Cucharitas Plásticas', quantity: 4 }, { supply_name: 'Servilletas de Papel', quantity: 4 }],
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'hel-pres-07', barcode: '750900010007', name: 'Pote 1 Kg (Hasta 4 Sabores)', category: 'Presentaciones Helado',
    cost_price: 6800, sale_price: 16500, stock: 999, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21,
    is_icecream_presentation: true, max_flavors: 4, total_grams: 1000,
    default_supplies: [{ supply_name: 'Pote Térmico 1 Kg', quantity: 1 }, { supply_name: 'Cucharitas Plásticas', quantity: 6 }, { supply_name: 'Servilletas de Papel', quantity: 6 }],
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'hel-pres-08', barcode: '750900010008', name: 'Copa Helada (2 Sabores)', category: 'Presentaciones Helado',
    cost_price: 1800, sale_price: 5000, stock: 999, min_stock_alert: 5, unit: 'pz', tax_rate: 0.21,
    is_icecream_presentation: true, max_flavors: 2, total_grams: 160,
    default_supplies: [{ supply_name: 'Copa Sundae', quantity: 1 }, { supply_name: 'Cucharitas Plásticas', quantity: 1 }],
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z',
  },
  { id: 'flav-01', barcode: '300000000001', name: 'Dulce de Leche Granizado', category: 'Sabores de Helado', cost_price: 3500, sale_price: 0, stock: 14.5, min_stock_alert: 3, unit: 'kg', tax_rate: 0, is_raw_flavor: true, batch_number: 'B-DDL09', created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-02', barcode: '300000000002', name: 'Chocolate Amargo 70%', category: 'Sabores de Helado', cost_price: 4200, sale_price: 0, stock: 12, min_stock_alert: 3, unit: 'kg', tax_rate: 0, is_raw_flavor: true, batch_number: 'B-CHOC04', created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-03', barcode: '300000000003', name: 'Frutilla a la Crema', category: 'Sabores de Helado', cost_price: 3200, sale_price: 0, stock: 8.5, min_stock_alert: 2.5, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-04', barcode: '300000000004', name: 'Pistacho Siciliano', category: 'Sabores de Helado', cost_price: 6500, sale_price: 0, stock: 6.2, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-05', barcode: '300000000005', name: 'Crema Americana', category: 'Sabores de Helado', cost_price: 3000, sale_price: 0, stock: 15, min_stock_alert: 4, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-06', barcode: '300000000006', name: 'Limón al Agua', category: 'Sabores de Helado', cost_price: 2800, sale_price: 0, stock: 9.8, min_stock_alert: 3, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-07', barcode: '300000000007', name: 'Tramontana', category: 'Sabores de Helado', cost_price: 3500, sale_price: 0, stock: 11, min_stock_alert: 3, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-08', barcode: '300000000008', name: 'Menta Granizada', category: 'Sabores de Helado', cost_price: 3200, sale_price: 0, stock: 7, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-09', barcode: '300000000009', name: 'Maracuyá al Agua', category: 'Sabores de Helado', cost_price: 3100, sale_price: 0, stock: 5.5, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-10', barcode: '300000000010', name: 'Sambayón', category: 'Sabores de Helado', cost_price: 4000, sale_price: 0, stock: 6.8, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-11', barcode: '300000000011', name: 'Dulce de Leche con Brownie', category: 'Sabores de Helado', cost_price: 3800, sale_price: 0, stock: 10, min_stock_alert: 3, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-12', barcode: '300000000012', name: 'Banana Split', category: 'Sabores de Helado', cost_price: 3200, sale_price: 0, stock: 8, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-13', barcode: '300000000013', name: 'Crema del Cielo', category: 'Sabores de Helado', cost_price: 3000, sale_price: 0, stock: 9, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-14', barcode: '300000000014', name: 'Chocolate con Almendras', category: 'Sabores de Helado', cost_price: 4200, sale_price: 0, stock: 7.5, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-15', barcode: '300000000015', name: 'Mascarpone con Frutos Rojos', category: 'Sabores de Helado', cost_price: 4500, sale_price: 0, stock: 6, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-16', barcode: '300000000016', name: 'Ferrero Rocher', category: 'Sabores de Helado', cost_price: 4800, sale_price: 0, stock: 5, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-17', barcode: '300000000017', name: 'Kinotos al Whisky', category: 'Sabores de Helado', cost_price: 4000, sale_price: 0, stock: 4.5, min_stock_alert: 1.5, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-18', barcode: '300000000018', name: 'Flan con Dulce de Leche', category: 'Sabores de Helado', cost_price: 3500, sale_price: 0, stock: 8, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-19', barcode: '300000000019', name: 'Ananá al Agua', category: 'Sabores de Helado', cost_price: 2800, sale_price: 0, stock: 6, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'flav-20', barcode: '300000000020', name: 'Chocolate Blanco con Vauquita', category: 'Sabores de Helado', cost_price: 4000, sale_price: 0, stock: 7, min_stock_alert: 2, unit: 'kg', tax_rate: 0, is_raw_flavor: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'sup-01', barcode: '990000000001', name: 'Cucurucho Dulce Tradicional', category: 'Insumos y Utilidades', cost_price: 45, sale_price: 0, stock: 250, min_stock_alert: 50, unit: 'pz', tax_rate: 0, is_supply: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'sup-02', barcode: '990000000002', name: 'Cono Waffle Artesanal', category: 'Insumos y Utilidades', cost_price: 90, sale_price: 0, stock: 180, min_stock_alert: 40, unit: 'pz', tax_rate: 0, is_supply: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'sup-03', barcode: '990000000003', name: 'Vasito Térmico Chico', category: 'Insumos y Utilidades', cost_price: 55, sale_price: 0, stock: 220, min_stock_alert: 50, unit: 'pz', tax_rate: 0, is_supply: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'sup-06', barcode: '990000000006', name: 'Pote Térmico 500g', category: 'Insumos y Utilidades', cost_price: 120, sale_price: 0, stock: 160, min_stock_alert: 35, unit: 'pz', tax_rate: 0, is_supply: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'sup-07', barcode: '990000000007', name: 'Pote Térmico 1 Kg', category: 'Insumos y Utilidades', cost_price: 180, sale_price: 0, stock: 180, min_stock_alert: 40, unit: 'pz', tax_rate: 0, is_supply: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'sup-09', barcode: '990000000009', name: 'Cucharitas Plásticas', category: 'Insumos y Utilidades', cost_price: 8, sale_price: 0, stock: 1650, min_stock_alert: 300, unit: 'pz', tax_rate: 0, is_supply: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'kio-01', barcode: '779123456001', name: 'Coca Cola 500ml', category: 'Bebidas', cost_price: 900, sale_price: 1500, stock: 48, min_stock_alert: 12, unit: 'pz', tax_rate: 0.21, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'kio-02', barcode: '779123456002', name: 'Alfajor Jorgito Negro x6', category: 'Alfajores', cost_price: 600, sale_price: 1000, stock: 30, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'kio-03', barcode: '779123456003', name: 'Lays Clásicas 45g', category: 'Snacks', cost_price: 700, sale_price: 1200, stock: 25, min_stock_alert: 8, unit: 'pz', tax_rate: 0.21, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'kio-04', barcode: '779123456004', name: 'KitKat 41.5g', category: 'Chocolates', cost_price: 800, sale_price: 1400, stock: 40, min_stock_alert: 10, unit: 'pz', tax_rate: 0.21, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
];

export const ICE_CREAM_SALES: Sale[] = [
  {
    id: 'sale-hel-01', folio: 'TKT-2026-5001', cashier_name: 'Caja 01',
    items: [{
        product_id: 'hel-pres-06', barcode: '750900010006', product_name: 'Pote 1/2 Kg (Hasta 3 Sabores)', category: 'Presentaciones Helado', unit: 'pz', quantity: 1, cost_price: 3800, unit_price: 9500, discount_percent: 0, tax_rate: 0.21, subtotal: 9500, tax: 1995, total: 11495, profit: 5700,
        selected_flavors: [{ flavor_id: 'flav-01', flavor_name: 'Dulce de Leche Granizado', grams: 250 }, { flavor_id: 'flav-11', flavor_name: 'Dulce de Leche con Brownie', grams: 250 }],
        selected_supplies: [{ supply_name: 'Pote Térmico 500g', quantity: 1 }, { supply_name: 'Cucharitas Plásticas', quantity: 4 }],
    }],
    subtotal: 9500, discount: 0, tax: 1995, total: 11495, cost_total: 3800, net_profit: 5700, profit_margin: 49.58, payment_method: 'efectivo', amount_paid: 12000, change: 505, created_at: '2026-10-02T10:15:00Z',
  },
];

export const ICE_CREAM_CASH_SESSION: CashSession = {
  id: 'ses-hel-01', cashier_name: 'Caja 01', opened_at: '2026-10-02T08:00:00Z', initial_cash: 25000, cash_sales: 11495, card_sales: 0, transfer_sales: 0, cash_withdrawals: 0, expected_cash: 36495, status: 'abierta',
};