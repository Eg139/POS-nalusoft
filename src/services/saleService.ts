import { Product, Sale, CashSession, StockMovement } from '../types';

export interface SaleDeps {
  getProducts: () => Product[];
  saveProducts: (products: Product[]) => void;
  getSales: () => Sale[];
  saveSales: (sales: Sale[]) => void;
  recordStockMovement: (mov: Omit<StockMovement, 'id' | 'created_at'>) => StockMovement;
  getCashSession: () => CashSession;
  updateCashSession: (session: CashSession) => void;
}

export function processSaleTransaction(
  saleData: Omit<Sale, 'id' | 'folio' | 'created_at'>,
  deps: SaleDeps
): Sale {
  const sales = deps.getSales();
  const folioNumber = sales.length + 1001;
  const newSale: Sale = {
    ...saleData,
    id: `sale-${Date.now()}`,
    folio: `TKT-${new Date().getFullYear()}-${String(folioNumber).padStart(4, '0')}`,
    created_at: new Date().toISOString(),
  };

  sales.unshift(newSale);
  deps.saveSales(sales);

  const products = deps.getProducts();
  const nowIso = new Date().toISOString();

  for (const item of newSale.items) {
    const prod = products.find((p) => p.id === item.product_id);
    if (prod && (!prod.is_icecream_presentation || prod.stock < 900)) {
      const prev = prod.stock;
      prod.stock = Math.max(0, Number((prev - item.quantity).toFixed(3)));
      prod.updated_at = nowIso;
      deps.recordStockMovement({
        product_id: prod.id,
        product_name: prod.name,
        barcode: prod.barcode,
        type: 'venta',
        quantity: -item.quantity,
        previous_stock: prev,
        new_stock: prod.stock,
        reason: `Venta Ticket ${newSale.folio}`,
      });
    }

    if (item.selected_flavors?.length) {
      for (const fl of item.selected_flavors) {
        const flavorProd = products.find(
          (p) => p.id === fl.flavor_id || p.name.toLowerCase().includes(fl.flavor_name.toLowerCase())
        );
        if (flavorProd) {
          const gramsSold = fl.grams * item.quantity;
          const deductUnits = flavorProd.unit === 'kg' ? gramsSold / 1000 : gramsSold;
          const prev = flavorProd.stock;
          flavorProd.stock = Math.max(0, Number((prev - deductUnits).toFixed(3)));
          flavorProd.updated_at = nowIso;
          deps.recordStockMovement({
            product_id: flavorProd.id,
            product_name: flavorProd.name,
            barcode: flavorProd.barcode,
            type: 'venta',
            quantity: -deductUnits,
            previous_stock: prev,
            new_stock: flavorProd.stock,
            reason: `Consumo sabor (${gramsSold}g) en "${item.product_name}" - Ticket ${newSale.folio}`,
          });
        }
      }
    }

    if (item.selected_supplies?.length) {
      for (const sup of item.selected_supplies) {
        const sName = sup.supply_name.toLowerCase();
        const supplyProd = products.find((p) => {
          if (sup.supply_id && p.id === sup.supply_id) return true;
          const pName = p.name.toLowerCase();
          return pName.includes(sName) || sName.includes(pName);
        });
        if (supplyProd) {
          const qtyDeducted = sup.quantity * item.quantity;
          const prev = supplyProd.stock;
          supplyProd.stock = Math.max(0, Number((prev - qtyDeducted).toFixed(3)));
          supplyProd.updated_at = nowIso;
          deps.recordStockMovement({
            product_id: supplyProd.id,
            product_name: supplyProd.name,
            barcode: supplyProd.barcode,
            type: 'venta',
            quantity: -qtyDeducted,
            previous_stock: prev,
            new_stock: supplyProd.stock,
            reason: `Insumo consumido (${qtyDeducted} ${supplyProd.unit}) - Ticket ${newSale.folio}`,
          });
        }
      }
    }
  }

  deps.saveProducts(products);

  const session = deps.getCashSession();
  if (session && session.status === 'abierta') {
    if (newSale.payment_method === 'efectivo') {
      session.cash_sales = Number((session.cash_sales + newSale.total).toFixed(2));
      session.expected_cash = Number((session.expected_cash + newSale.total).toFixed(2));
    } else if (newSale.payment_method === 'tarjeta') {
      session.card_sales = Number((session.card_sales + newSale.total).toFixed(2));
    } else if (newSale.payment_method === 'transferencia') {
      session.transfer_sales = Number((session.transfer_sales + newSale.total).toFixed(2));
    }
    deps.updateCashSession(session);
  }

  return newSale;
}
