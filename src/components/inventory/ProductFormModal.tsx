import React, { useState } from 'react';
import { Product, ProductCategory, ProductUnit } from '../../types';
import { X, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(product);

  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Abarrotes');
  const [costPrice, setCostPrice] = useState<string>(product ? product.cost_price.toString() : '');
  const [salePrice, setSalePrice] = useState<string>(product ? product.sale_price.toString() : '');
  const [stock, setStock] = useState<string>(product ? product.stock.toString() : '10');
  const [minStockAlert, setMinStockAlert] = useState<string>(product ? product.min_stock_alert.toString() : '5');
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'pz');
  const [taxRate, setTaxRate] = useState<string>(product ? (product.tax_rate * 100).toString() : '0');
  const [expiryDate, setExpiryDate] = useState(product?.expiry_date || '');
  const [batchNumber, setBatchNumber] = useState(product?.batch_number || '');
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
      expiry_date: expiryDate || undefined,
      batch_number: batchNumber.trim() || undefined,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(newProd);
  };

  const categories: ProductCategory[] = [
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
                Departamento / Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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

          {/* Row 5: Expiration & Batch for Perishables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Caducidad / Vencimiento (Opcional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lote de Fabricación (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. L-9921"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
