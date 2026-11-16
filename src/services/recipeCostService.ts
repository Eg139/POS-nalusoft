import { Product, RecipeItem, StockMovement } from '../types';

export function recalculateDependentRecipes(
  products: Product[],
  changedIngredientIds: Set<string>
): number {
  let recalculatedCount = 0;
  const nowIso = new Date().toISOString();

  for (const prod of products) {
    if (prod.has_recipe && prod.recipe && prod.recipe.length > 0) {
      const usesChanged = prod.recipe.some((item) => changedIngredientIds.has(item.ingredient_id));
      if (!usesChanged) continue;

      let calculatedCost = 0;
      for (const component of prod.recipe) {
        const ingProd = products.find((p) => p.id === component.ingredient_id);
        if (ingProd) {
          calculatedCost += ingProd.cost_price * component.quantity_needed;
        }
      }

      const previousCost = prod.cost_price;
      const newCost = Number(calculatedCost.toFixed(2));
      if (previousCost > 0 && newCost > previousCost && prod.sale_price > 0) {
        const marginRatio = prod.sale_price / previousCost;
        prod.sale_price = Number((newCost * marginRatio).toFixed(2));
      }
      prod.cost_price = newCost;
      prod.updated_at = nowIso;
      recalculatedCount++;
    }
  }

  return recalculatedCount;
}

export function applyRecipeToProduct(
  products: Product[],
  productId: string,
  recipe: RecipeItem[],
  hasRecipe: boolean
): Product[] {
  const index = products.findIndex((p) => p.id === productId);
  if (index < 0) return products;

  let calculatedCost = 0;
  if (hasRecipe && recipe.length > 0) {
    for (const item of recipe) {
      const ing = products.find((p) => p.id === item.ingredient_id);
      if (ing) calculatedCost += ing.cost_price * item.quantity_needed;
    }
  }

  const sanitizedRecipe = recipe.map((item) => ({
    ...item,
    ingredient_name: item.ingredient_name || 'Ingrediente',
  }));

  products[index] = {
    ...products[index],
    recipe: sanitizedRecipe,
    has_recipe: hasRecipe,
    cost_price:
      hasRecipe && recipe.length > 0 ? Number(calculatedCost.toFixed(2)) : products[index].cost_price,
    updated_at: new Date().toISOString(),
  };

  return products;
}

export function executeProductionBatch(
  products: Product[],
  productId: string,
  quantityProduced: number,
  recordMovement: (mov: Omit<StockMovement, 'id' | 'created_at'>) => void
): Product[] {
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex < 0) return products;

  const product = products[productIndex];
  const prevStock = product.stock || 0;
  product.stock = Number((prevStock + quantityProduced).toFixed(3));
  product.updated_at = new Date().toISOString();

  recordMovement({
    product_id: product.id,
    product_name: product.name,
    barcode: product.barcode,
    type: 'produccion',
    quantity: quantityProduced,
    previous_stock: prevStock,
    new_stock: product.stock,
    reason: `Producción de lote (${quantityProduced} ${product.unit || 'unidades'})`,
  });

  if (product.has_recipe && product.recipe?.length) {
    for (const item of product.recipe) {
      const ing = products.find((p) => p.id === item.ingredient_id);
      if (!ing) continue;
      const requiredAmount = item.quantity_needed * quantityProduced;
      const prevIngStock = ing.stock || 0;
      ing.stock = Math.max(0, Number((prevIngStock - requiredAmount).toFixed(3)));
      ing.updated_at = new Date().toISOString();
      recordMovement({
        product_id: ing.id,
        product_name: ing.name,
        barcode: ing.barcode,
        type: 'produccion',
        quantity: -requiredAmount,
        previous_stock: prevIngStock,
        new_stock: ing.stock,
        reason: `Consumo por producción de "${product.name}" (Lote: ${quantityProduced})`,
      });
    }
  }

  return products;
}
