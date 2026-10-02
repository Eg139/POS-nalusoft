import React, { useState } from 'react';
import { Product } from '../../types';
import { X, Check, Sparkles, Calendar, Tag, Scale, AlertCircle } from 'lucide-react';

interface IceCreamBatchModalProps {
  flavor?: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}

const POPULAR_FLAVORS = [
  'Dulce de Leche Granizado',
  'Chocolate Belga Amargo 70%',
  'Frutilla / Fresa al Agua',
  'Pistacho Siciliano Puro',
  'Vainilla Francesa / Crema Americana',
  'Limón Criollo con Menta',
  'Tramontana (Vainilla con Dulce de Leche y Galletitas)',
  'Menta Granizada',
  'Maracuyá Silvestre al Agua',
  'Sambayón al Oporto con Cerezas',
  'Tiramisú Artesanal',
  'Banana Split con Dulce de Leche',
  'Mango Tropical al Agua',
  'Café Expreso con Almendras',
  'Mascarpone con Frutos del Bosque',
];

export const IceCreamBatchModal: React.FC<IceCreamBatchModalProps> = ({
  flavor,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(flavor);
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(flavor?.name.replace(/^Sabor:\s*/i, '') || '');
  const [manufacturingDate, setManufacturingDate] = useState(
    flavor?.manufacturing_date || todayStr
  );
  const [batchNumber, setBatchNumber] = useState(
    flavor?.batch_number || `BACHA-${todayStr.replace(/-/g, '').slice(2)}-01`
  );
  const [stockKg, setStockKg] = useState<string>(
    flavor ? flavor.stock.toString() : '12.0'
  );
  const [minAlertKg, setMinAlertKg] = useState<string>(
    flavor ? flavor.min_stock_alert.toString() : '3.0'
  );
  const [costPrice, setCostPrice] = useState<string>(
    flavor ? flavor.cost_price.toString() : '90.00'
  );
  const [salePrice, setSalePrice] = useState<string>(
    flavor ? flavor.sale_price.toString() : '240.00'
  );

  // Compute default expiry (+60 days from manufacturing date)
  const defaultExpiry = (() => {
    try {
      const d = new Date(manufacturingDate || todayStr);
      d.setDate(d.getDate() + 60);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  })();

  const [expiryDate, setExpiryDate] = useState(flavor?.expiry_date || defaultExpiry);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateNewBatchNumber = () => {
    const cleanDate = (manufacturingDate || todayStr).replace(/-/g, '').slice(2);
    const randCode = Math.floor(10 + Math.random() * 90);
    const slug = name ? name.slice(0, 3).toUpperCase() : 'ICE';
    setBatchNumber(`B-${slug}-${cleanDate}-${randCode}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del sabor es obligatorio.');
      return;
    }

    const parsedStock = parseFloat(stockKg);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setErrorMsg('La cantidad de stock en kg debe ser un número válido mayor o igual a 0.');
      return;
    }

    const parsedCost = parseFloat(costPrice) || 80;
    const parsedSale = parseFloat(salePrice) || 240;

    const formattedName = name.trim().startsWith('Sabor:') ? name.trim() : `Sabor: ${name.trim()}`;

    const newFlavorProd: Product = {
      id: flavor?.id || `flav-${Date.now()}`,
      barcode: flavor?.barcode || '300' + Math.floor(100000000 + Math.random() * 900000000).toString(),
      name: formattedName,
      category: 'Sabores a Granel',
      cost_price: parsedCost,
      sale_price: parsedSale,
      stock: parsedStock,
      min_stock_alert: parseFloat(minAlertKg) || 2.5,
      unit: 'kg',
      tax_rate: 0,
      is_raw_flavor: true,
      manufacturing_date: manufacturingDate,
      expiry_date: expiryDate || undefined,
      batch_number: batchNumber.trim() || undefined,
      created_at: flavor?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(newFlavorProd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍧</span>
            <div>
              <h3 className="font-extrabold text-base">
                {isEditing ? 'Editar Bacha / Sabor' : 'Registrar Nueva Bacha de Helado'}
              </h3>
              <p className="text-xs text-pink-100">
                Control de obrador, elaboración artesanal y stock a granel en kg
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sabor Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Nombre del Sabor de Helado *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Dulce de Leche Granizado, Chocolate Belga..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-pink-500"
            />

            {/* Popular flavor chips */}
            {!isEditing && (
              <div className="mt-2">
                <span className="text-[10px] text-slate-500 block mb-1">
                  Sugerencias rápidas de obrador:
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                  {POPULAR_FLAVORS.map((pop) => (
                    <button
                      key={pop}
                      type="button"
                      onClick={() => {
                        setName(pop);
                        generateNewBatchNumber();
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-900 border border-slate-200 transition-colors"
                    >
                      + {pop}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Fabricación y Lote */}
          <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-950 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span>Fabricación y Trazabilidad de Bacha</span>
              </span>
              <button
                type="button"
                onClick={generateNewBatchNumber}
                className="text-[10px] font-bold text-pink-700 hover:text-pink-900 flex items-center gap-1 underline"
              >
                <span>⚡ Auto Lote</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Fabricación / Elaboración *
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    required
                    value={manufacturingDate}
                    onChange={(e) => setManufacturingDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => setManufacturingDate(todayStr)}
                    className="px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 hover:bg-pink-100 text-pink-800 rounded-lg"
                  >
                    Hoy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lote / N° de Bacha *
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. BACHA-DDL-01"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Caducidad Estimada
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alerta Mínima de Bacha (Kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={minAlertKg}
                  onChange={(e) => setMinAlertKg(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Cantidad de Helado Disponible en Kg */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Stock en Bacha (Kilogramos Disponibles)</span>
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={stockKg}
                  onChange={(e) => setStockKg(e.target.value)}
                  className="w-full px-4 py-2.5 text-lg font-mono font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  KG
                </span>
              </div>

              {/* Quick weight buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setStockKg('6.0')}
                  className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-emerald-400 rounded-lg text-slate-700"
                >
                  6 kg (Media)
                </button>
                <button
                  type="button"
                  onClick={() => setStockKg('12.0')}
                  className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-emerald-400 rounded-lg text-slate-700"
                >
                  12 kg (Estándar)
                </button>
                <button
                  type="button"
                  onClick={() => setStockKg('15.0')}
                  className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-emerald-400 rounded-lg text-slate-700"
                >
                  15 kg (Llena)
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              ⚖️ Cada venta en el POS (Cono 80g, 160g, Pote 250g, 500g, 1000g) descontará los gramos exactos de esta cantidad.
            </p>
          </div>

          {/* Pricing (Costo y Venta) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Costo de Producción por Kg ($)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Precio de Venta Referencial por Kg ($)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 active:scale-98 rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios de Bacha' : 'Dar de Alta Bacha en Obrador'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
