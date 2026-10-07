import React, { useState, useEffect } from 'react';
import { Product, RecipeItem, ProductUnit } from '../../types';
import { StorageService } from '../../services/storageService';
import { X, Plus, Trash2, Save, IceCream } from 'lucide-react';

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
  onSave 
}) => {
  const allProducts = products.length > 0 ? products : StorageService.getProducts();
  const availableIngredients = allProducts.filter(p => p.id !== product?.id);

  // Estados locales
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'Elaborados');
  const [salePrice, setSalePrice] = useState<number>(product?.sale_price || 0);
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'kg');
  const [isRawFlavor, setIsRawFlavor] = useState<boolean>(product?.is_raw_flavor ?? false);
  const [hasRecipe, setHasRecipe] = useState<boolean>(product?.has_recipe ?? true);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>(product?.recipe || []);

  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);

  // Sincronizar estados si el producto cambia mientras el modal está abierto
  useEffect(() => {
    setName(product?.name || '');
    setCategory(product?.category || 'Elaborados');
    setSalePrice(product?.sale_price || 0);
    setUnit(product?.unit || 'kg');
    setIsRawFlavor(product?.is_raw_flavor ?? false);
    setHasRecipe(product?.has_recipe ?? true);
    setRecipeItems(product?.recipe || []);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    if (!selectedIngredientId) return;
    if (quantity <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }

    const ing = allProducts.find(p => p.id === selectedIngredientId);
    if (!ing) return;

    const ingredientName = ing.name || 'Ingrediente sin nombre';

    const existingIndex = recipeItems.findIndex(item => item.ingredient_id === ing.id);
    if (existingIndex >= 0) {
      const updated = [...recipeItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity_needed: updated[existingIndex].quantity_needed + Number(quantity)
      };
      setRecipeItems(updated);
    } else {
      setRecipeItems([
        ...recipeItems,
        {
          ingredient_id: ing.id,
          ingredient_name: ingredientName,
          quantity_needed: Number(quantity),
          unit: ing.unit || 'pz'
        }
      ]);
    }
    setSelectedIngredientId('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la receta o sabor.');
      return;
    }

    const formattedRecipe: RecipeItem[] = recipeItems.map(item => ({
      ...item,
      ingredient_name: item.ingredient_name!
    }));

    const targetId = product?.id || `prod_${Date.now()}`;
    const finalCategory = isRawFlavor ? 'Sabores de Helado' : category.trim();

    const productData: Product = {
      id: targetId,
      barcode: product?.barcode || '',
      name: name.trim(),
      category: finalCategory,
      cost_price: product?.cost_price || 0,
      sale_price: Number(salePrice),
      stock: product?.stock || 0,
      min_stock_alert: product?.min_stock_alert || 5,
      unit: unit,
      tax_rate: product?.tax_rate || 0,
      has_recipe: hasRecipe,
      recipe: formattedRecipe,
      is_raw_flavor: isRawFlavor,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Guardado centralizado en el StorageService
    StorageService.saveProduct(productData);
    
    onSave(targetId, formattedRecipe, hasRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Configurar Receta / Producción</h3>
            <p className="text-sm text-gray-500">{product ? product.name : 'Nueva Receta o Sabor'}</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Selector para indicar si es un sabor de helado a granel */}
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <IceCream className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-gray-800 text-sm block">¿Es un sabor de helado a granel (batch)?</span>
                <p className="text-xs text-gray-600">Se usará en el punto de venta para armar potes (1kg, 1/2kg, etc.)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isRawFlavor} 
                onChange={(e) => {
                  setIsRawFlavor(e.target.checked);
                  if (e.target.checked) {
                    setCategory('Sabores de Helado');
                  }
                }}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isRawFlavor ? 'Nombre del Sabor *' : 'Nombre de la Receta / Plato *'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRawFlavor ? "Ej. Dulce de Leche Granizado" : "Ej. Sándwich de Milanesa"}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría</label>
              <input
                type="text"
                value={category}
                disabled={isRawFlavor}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Comidas, Bebidas, Helados"
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ${
                  isRawFlavor ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Precio de Venta ($)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Unidad de Medida</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="kg">Kilogramo (kg)</option>
                <option value="lt">Litro (lt)</option>
                <option value="pz">Pieza (pz)</option>
                <option value="gr">Gramo (gr)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="paq">Paquete (paq)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div>
              <span className="font-semibold text-gray-800">¿Este producto requiere receta de producción?</span>
              <p className="text-xs text-gray-500">Descuenta automáticamente las materias primas del inventario al producir.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={hasRecipe} 
                onChange={(e) => setHasRecipe(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {hasRecipe && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-lg border">
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Materia Prima / Insumo</label>
                  <select
                    value={selectedIngredientId}
                    onChange={(e) => setSelectedIngredientId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Seleccionar ingrediente...</option>
                    {availableIngredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (Stock: {ing.stock} {ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cantidad necesaria</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="w-full flex items-center justify-center gap-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-xs font-semibold text-gray-600 border-b">
                      <th className="py-2.5 px-4">Ingrediente / Insumo</th>
                      <th className="py-2.5 px-4 text-center">Cantidad</th>
                      <th className="py-2.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {recipeItems.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-6 text-gray-400">
                          No hay ingredientes agregados a esta receta todavía.
                        </td>
                      </tr>
                    ) : (
                      recipeItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2.5 px-4 font-medium text-gray-800">{item.ingredient_name || 'Ingrediente'}</td>
                          <td className="py-2.5 px-4 text-center">
                            {item.quantity_needed} {item.unit}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> Guardar Receta
          </button>
        </div>

      </div>
    </div>
  );
};