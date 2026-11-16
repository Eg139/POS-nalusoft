import { Product, ReceiptImportSummary, ReceiptReviewItem, StockMovement } from '../types';
import { recalculateDependentRecipes } from './recipeCostService';

export function applyReceiptBatch(
  products: Product[],
  items: ReceiptReviewItem[],
  recordMovement: (mov: Omit<StockMovement, 'id' | 'created_at'>) => void
): { products: Product[]; summary: ReceiptImportSummary } {
  const updatedProducts = [...products];
  const changedIngredientIds = new Set<string>();
  const nowIso = new Date().toISOString();

  let updatedCount = 0;
  let createdCount = 0;

  for (const row of items) {
    if (!row.selected || row.quantity <= 0) continue;

    const cleanBarcode = row.barcode.trim();
    const cleanName = row.name.trim();
    if (!cleanName) continue;

    const existingIdx = updatedProducts.findIndex(
      (p) =>
        (row.matchedProductId && p.id === row.matchedProductId) ||
        (cleanBarcode && p.barcode === cleanBarcode) ||
        p.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingIdx >= 0) {
      const existing = { ...updatedProducts[existingIdx] };
      const prevStock = existing.stock;
      const newStock = Number((prevStock + row.quantity).toFixed(3));
      existing.stock = newStock;
      if (row.cost_price > 0) {
        existing.cost_price = Number(row.cost_price.toFixed(2));
        changedIngredientIds.add(existing.id);
      }
      if (cleanBarcode && !existing.barcode) {
        existing.barcode = cleanBarcode;
      }
      existing.updated_at = nowIso;
      updatedProducts[existingIdx] = existing;
      updatedCount++;

      recordMovement({
        product_id: existing.id,
        product_name: existing.name,
        barcode: existing.barcode,
        type: 'compra',
        quantity: row.quantity,
        previous_stock: prevStock,
        new_stock: newStock,
        reason: 'Ingreso por escaneo de boleta IA',
      });
    } else {
      const newId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const fallbackBarcode = cleanBarcode || `IA-${Math.floor(100000 + Math.random() * 900000)}`;
      const cost = Math.max(0, Number(row.cost_price.toFixed(2)));
      const sale =
        row.sale_price > 0 ? Number(row.sale_price.toFixed(2)) : Number((cost * 1.35).toFixed(2));

      const created: Product = {
        id: newId,
        barcode: fallbackBarcode,
        name: cleanName,
        category: row.category || 'Otros',
        cost_price: cost,
        sale_price: sale,
        stock: Number(row.quantity.toFixed(3)),
        min_stock_alert: 5,
        unit: row.unit || 'pz',
        tax_rate: 0,
        created_at: nowIso,
        updated_at: nowIso,
      };
      updatedProducts.unshift(created);
      createdCount++;

      recordMovement({
        product_id: created.id,
        product_name: created.name,
        barcode: created.barcode,
        type: 'compra',
        quantity: created.stock,
        previous_stock: 0,
        new_stock: created.stock,
        reason: 'Alta por escaneo de boleta IA',
      });
    }
  }

  const recalculatedRecipesCount =
    changedIngredientIds.size > 0
      ? recalculateDependentRecipes(updatedProducts, changedIngredientIds)
      : 0;

  return {
    products: updatedProducts,
    summary: { updatedCount, createdCount, recalculatedRecipesCount },
  };
}
