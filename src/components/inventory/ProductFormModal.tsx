import React, { useState } from 'react';
import { Product, ProductCategory, ProductUnit } from '../../types';
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
    // Generate valid 12-digit EAN-like code
    const random12 = '750' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setBarcode(random12);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del producto es obligatorio.');
      return;
    }
    if (!barcode.trim()) {
      setErrorMsg('El código de barras es obligatorio.');
      return;
    }
    if (parsedSale <= 0) {
      setErrorMsg('El precio de venta debe ser mayor a 0.');
      return;
    }

    const newProd: Product = {
      id: product?.id || `prod-${Date.now()}`,
      barcode: barcode.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
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
                <label className="text-xs font-semibold text-slate-700">Código de Barras *</label>
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
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="750100012345"
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
                placeholder="Ej. Arroz Súper Extra 1 kg"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Category & Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento / Categoría (Seleccionar o escribir nueva)
              </label>
              <input
                type="text"
                list="category-suggestions"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Helados por Kilo, Conos, Paletas..."
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
                  <option value="0">0% (Alimentos básicos)</option>
                  <option value="16">16% (IVA General)</option>
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
              <p className="text-[10px] text-slate-400 mt-1">
                Se notificará en el panel de alarmas cuando baje de esta cantidad.
              </p>
            </div>
          </div>

          {/* Row 5: Manufacturing Date, Expiration & Batch */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>📅</span>
              <span>Trazabilidad: Fabricación, Caducidad y Lote</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Fabricación
                </label>
                <input
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Caducidad
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lote / N° de Bacha
                </label>
                <input
                  type="text"
                  placeholder="Ej. BACHA-2026-01"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Row 6: Tipo de Producto en Heladería */}
          <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-pink-950 uppercase tracking-wider flex items-center gap-1.5">
              <span>🍨</span>
              <span>Configuración de Heladería</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-pink-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRawFlavor}
                  onChange={(e) => {
                    setIsRawFlavor(e.target.checked);
                    if (e.target.checked) {
                      setIsIceCreamPresentation(false);
                      setIsSupply(false);
                      setUnit('kg');
                    }
                  }}
                  className="mt-0.5 rounded text-pink-600 focus:ring-pink-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Sabor en Bacha</span>
                  <span className="text-[10px] text-slate-500 block">
                    Materia prima a granel en kg para servir en mostrador.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-pink-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isIceCreamPresentation}
                  onChange={(e) => {
                    setIsIceCreamPresentation(e.target.checked);
                    if (e.target.checked) {
                      setIsRawFlavor(false);
                      setIsSupply(false);
                      setUnit('pz');
                    }
                  }}
                  className="mt-0.5 rounded text-pink-600 focus:ring-pink-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Presentación / Envase</span>
                  <span className="text-[10px] text-slate-500 block">
                    Cono, vasito o pote que abre el modal de sabores al vender.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-pink-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSupply}
                  onChange={(e) => {
                    setIsSupply(e.target.checked);
                    if (e.target.checked) {
                      setIsRawFlavor(false);
                      setIsIceCreamPresentation(false);
                      setUnit('pz');
                    }
                  }}
                  className="mt-0.5 rounded text-pink-600 focus:ring-pink-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Insumo / Utilidad</span>
                  <span className="text-[10px] text-slate-500 block">
                    Cucharitas, servilletas o conos que se descuentan en la venta.
                  </span>
                </div>
              </label>
            </div>

            {/* If presentation is checked, show grams and combinations */}
            {isIceCreamPresentation && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-200">
                <div>
                  <label className="block text-xs font-semibold text-pink-900 mb-1">
                    Gramaje Total de Helado (Gramos)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={totalGrams}
                    onChange={(e) => setTotalGrams(e.target.value)}
                    placeholder="Ej. 1000, 500, 250, 180, 160, 120, 80"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-pink-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                  />
                  <span className="text-[10px] text-pink-700 block mt-0.5">
                    Ej: 1000 para 1kg, 500 para 1/2kg, 160 para Cono Doble, 80 para Cono Simple.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-pink-900 mb-1">
                    Límite de Combinaciones / Sabores
                  </label>
                  <select
                    value={maxFlavors}
                    onChange={(e) => setMaxFlavors(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-pink-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="1">1 Sabor Simple</option>
                    <option value="2">Hasta 2 Sabores</option>
                    <option value="3">Hasta 3 Sabores</option>
                    <option value="4">Hasta 4 Sabores (Exclusivo 1 Kg)</option>
                  </select>
                </div>
              </div>
            )}
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
