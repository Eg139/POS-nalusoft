import React, { useState } from 'react';
import { Product, ProductUnit } from '../../types';
import { X, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  categories?: string[];
  onSave: (product: Product) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories = [],
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(product);

  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<string>(product?.category || (categories.length > 0 ? categories[0] : 'Helados'));
  const [costPrice, setCostPrice] = useState<string>(product ? product.cost_price.toString() : '');
  const [salePrice, setSalePrice] = useState<string>(product ? product.sale_price.toString() : '');
  const [stock, setStock] = useState<string>(product ? product.stock.toString() : '10');
  const [minStockAlert, setMinStockAlert] = useState<string>(product ? product.min_stock_alert.toString() : '5');
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'pz');
  const [taxRate, setTaxRate] = useState<string>(product ? (product.tax_rate * 100).toString() : '0');
  const [manufacturingDate, setManufacturingDate] = useState(product?.manufacturing_date || '');
  const [expiryDate, setExpiryDate] = useState(product?.expiry_date || '');
  const [batchNumber, setBatchNumber] = useState(product?.batch_number || '');
  const [isRawFlavor, setIsRawFlavor] = useState<boolean>(product?.is_raw_flavor || false);
  const [isIceCreamPresentation, setIsIceCreamPresentation] = useState<boolean>(product?.is_icecream_presentation || false);
  const [totalGrams, setTotalGrams] = useState<string>(product?.total_grams?.toString() || '1000');
  const [maxFlavors, setMaxFlavors] = useState<string>(product?.max_flavors?.toString() || '4');
  const [isSupply, setIsSupply] = useState<boolean>(product?.is_supply || false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const parsedCost = parseFloat(costPrice) || 0;
  const parsedSale = parseFloat(salePrice) || 0;

  // Real-time Margin & Markup calculation
  const profitPerUnit = Math.max(0, parsedSale - parsedCost);
  const profitMarginPercent = parsedSale > 0 ? ((profitPerUnit / parsedSale) * 100).toFixed(1) : '0';
  const markupPercent = parsedCost > 0 ? (((parsedSale - parsedCost) / parsedCost) * 100).toFixed(1) : '0';

  const generateRandomBarcode = () => {
    const random12 = '750' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setBarcode(random12);
  };

  // ✅ Corregido con SubmitEvent para evitar el aviso de deprecación
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('El nombre del producto es obligatorio.');
      return;
    }
    if (parsedSale <= 0) {
      setErrorMsg('El precio de venta debe ser mayor a 0.');
      return;
    }

    // Si no se ingresa código de barras, generamos uno interno automático para comercios de barrio
    const finalBarcode = barcode.trim() || `INT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProd: Product = {
      id: product?.id || `prod-${Date.now()}`,
      barcode: finalBarcode,
      name: name.trim(),
      category,
      cost_price: parsedCost,
      sale_price: parsedSale,
      stock: parseFloat(stock) || 0,
      min_stock_alert: parseFloat(minStockAlert) || 5,
      unit,
      tax_rate: (parseFloat(taxRate) || 0) / 100,
      manufacturing_date: manufacturingDate || undefined,
      expiry_date: expiryDate || undefined,
      batch_number: batchNumber.trim() || undefined,
      is_raw_flavor: isRawFlavor,
      is_icecream_presentation: isIceCreamPresentation,
      total_grams: isIceCreamPresentation ? parseFloat(totalGrams) || 1000 : undefined,
      max_flavors: isIceCreamPresentation ? parseInt(maxFlavors, 10) || 4 : undefined,
      is_supply: isSupply,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(newProd);
  };

  const defaultCategories: string[] = [
    'Helados por Kilo',
    'Conos y Vasitos',
    'Paletas Artesanales',
    'Malteadas y Bebidas',
    'Toppings y Adicionales',
    'Abarrotes',
    'Lácteos y Huevos',
    'Frutas y Verduras',
    'Carnicería y Embutidos',
    'Panadería y Tortillería',
    'Bebidas y Licores',
    'Snacks y Dulces',
    'Limpieza y Hogar',
    'Cuidado Personal',
  ];

  const allSuggestedCategories = Array.from(new Set([...categories, ...defaultCategories]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <h2 className="text-base font-bold">
            {isEditing ? 'Editar Producto del Catálogo' : 'Dar de Alta Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Barcode & Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Código de Barras (Opcional)</label>
                <button
                  type="button"
                  onClick={generateRandomBarcode}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generar</span>
                </button>
              </div>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Automático si se deja vacío"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Helado de Chocolate 1kg"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Category & Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento / Categoría
              </label>
              <input
                type="text"
                list="category-suggestions"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Helados por Kilo, Conos..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="category-suggestions">
                {allSuggestedCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidad de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pz">Pieza (pz)</option>
                <option value="kg">Kilogramo (kg) - Pesable</option>
                <option value="lt">Litro (lt)</option>
                <option value="paq">Paquete (paq)</option>
                <option value="gr">Gramos (gr)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Pricing & Margin Simulator */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Precios y Rendimiento / Margen
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Precio Costo / Compra ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Precio Venta al Público ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tasa IVA (%)
                </label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="0">0% (Exento / Alimentos)</option>
                  <option value="16">16% (General)</option>
                  <option value="8">8% (Frontera)</option>
                </select>
              </div>
            </div>

            {/* Live Profit Margin Stats */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600 gap-2">
              <div>
                <span>Ganancia por unidad: </span>
                <span className="font-bold font-mono text-emerald-700 tabular-nums">
                  ${profitPerUnit.toFixed(2)}
                </span>
              </div>
              <div>
                <span>Margen de Ganancia: </span>
                <span className="font-bold font-mono text-emerald-700 tabular-nums">
                  {profitMarginPercent}%
                </span>
              </div>
              <div>
                <span>Markup s/costo: </span>
                <span className="font-bold font-mono text-slate-800 tabular-nums">
                  {markupPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Stock & Alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Inicial / Actual
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alerta de Stock Mínimo
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};