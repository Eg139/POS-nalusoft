import React, { useState, useEffect } from 'react';
import { Product, RecipeItem, ProductUnit } from '../../types';
import { StorageService } from '../../services/storageService';
import { X, Save, AlertCircle } from 'lucide-react';
import { RecipeBasicFields } from './components/RecipeBasicFields';
import { RecipeIngredientsSection } from './components/RecipeIngredientsSection';

interface RecipeFormModalProps {
  isOpen: boolean;
  product?: Product | null;
  products: Product[];
  onClose: () => void;
  onSave: (productId: string, recipe: RecipeItem[], hasRecipe: boolean) => void;
}

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  product,
  products,
  onClose,
  onSave,
}) => {
  const allProducts = products.length > 0 ? products : StorageService.getProducts();
  const availableIngredients = allProducts.filter((p) => p.id !== product?.id);

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'Elaborados');
  const [salePrice, setSalePrice] = useState<number>(product?.sale_price || 0);
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'kg');
  const [isRawFlavor, setIsRawFlavor] = useState<boolean>(product?.is_raw_flavor ?? false);
  const [hasRecipe, setHasRecipe] = useState<boolean>(product?.has_recipe ?? true);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>(product?.recipe || []);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setName(product?.name || '');
    setCategory(product?.category || 'Elaborados');
    setSalePrice(product?.sale_price || 0);
    setUnit(product?.unit || 'kg');
    setIsRawFlavor(product?.is_raw_flavor ?? false);
    setHasRecipe(product?.has_recipe ?? true);
    setRecipeItems(product?.recipe || []);
    setValidationError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setValidationError(null);
    if (!selectedIngredientId) return;
    if (quantity <= 0) {
      setValidationError('La cantidad del ingrediente debe ser mayor a 0.');
      return;
    }

    const ing = allProducts.find((p) => p.id === selectedIngredientId);
    if (!ing) return;

    const existingIndex = recipeItems.findIndex((item) => item.ingredient_id === ing.id);
    if (existingIndex >= 0) {
      const updated = [...recipeItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity_needed: updated[existingIndex].quantity_needed + Number(quantity),
      };
      setRecipeItems(updated);
    } else {
      setRecipeItems([
        ...recipeItems,
        {
          ingredient_id: ing.id,
          ingredient_name: ing.name || 'Ingrediente sin nombre',
          quantity_needed: Number(quantity),
          unit: ing.unit || 'pz',
        },
      ]);
    }
    setSelectedIngredientId('');
    setQuantity(1);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setValidationError('Por favor ingresa un nombre para la receta o sabor.');
      return;
    }

    const formattedRecipe: RecipeItem[] = recipeItems.map((item) => ({
      ...item,
      ingredient_name: item.ingredient_name || 'Ingrediente',
    }));

    const targetId = product?.id || `prod_${Date.now()}`;
    const productData: Product = {
      id: targetId,
      barcode: product?.barcode || '',
      name: name.trim(),
      category: isRawFlavor ? 'Sabores de Helado' : category.trim(),
      cost_price: product?.cost_price || 0,
      sale_price: Number(salePrice),
      stock: product?.stock || 0,
      min_stock_alert: product?.min_stock_alert || 5,
      unit,
      tax_rate: product?.tax_rate || 0,
      has_recipe: hasRecipe,
      recipe: formattedRecipe,
      is_raw_flavor: isRawFlavor,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    StorageService.saveProduct(productData);
    onSave(targetId, formattedRecipe, hasRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3.5 bg-slate-50">
          <div className="min-w-0 pr-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Configurar Receta / Producción</h3>
            <p className="text-xs sm:text-sm text-slate-500 truncate">{product ? product.name : 'Nueva Receta o Sabor'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-w-0">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <RecipeBasicFields
            name={name}
            category={category}
            salePrice={salePrice}
            unit={unit}
            isRawFlavor={isRawFlavor}
            hasRecipe={hasRecipe}
            onNameChange={setName}
            onCategoryChange={setCategory}
            onSalePriceChange={setSalePrice}
            onUnitChange={setUnit}
            onToggleRawFlavor={(checked) => {
              setIsRawFlavor(checked);
              if (checked) setCategory('Sabores de Helado');
            }}
            onToggleHasRecipe={setHasRecipe}
          />

          {hasRecipe && (
            <RecipeIngredientsSection
              availableIngredients={availableIngredients}
              selectedIngredientId={selectedIngredientId}
              quantity={quantity}
              recipeItems={recipeItems}
              onSelectIngredient={setSelectedIngredientId}
              onQuantityChange={setQuantity}
              onAddIngredient={handleAddIngredient}
              onRemoveItem={(idx) => setRecipeItems(recipeItems.filter((_, i) => i !== idx))}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t px-4 sm:px-6 py-3.5 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Receta</span>
          </button>
        </div>
      </div>
    </div>
  );
};