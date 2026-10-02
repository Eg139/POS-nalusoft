import React, { useState } from 'react';
import { Product, StockMovementType } from '../../types';
import { X, ArrowDownRight, ArrowUpRight, Sliders, Check } from 'lucide-react';

interface StockAdjustModalProps {
  product: Product;
  onAdjust: (productId: string, quantityDelta: number, type: StockMovementType, reason: string) => void;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  product,
  onAdjust,
  onClose,
}) => {
  const [operationType, setOperationType] = useState<StockMovementType>('compra');
  const [amount, setAmount] = useState<string>('10');
  const [reason, setReason] = useState<string>('Recepción de pedido con proveedor');

  const parsedAmount = Math.abs(parseFloat(amount) || 0);

  // Compute stock delta based on type
  let delta = parsedAmount;
  if (operationType === 'merma') {
    delta = -parsedAmount;
  } else if (operationType === 'ajuste') {
    // If ajuste, amount is the new physical count
    delta = parsedAmount - product.stock;
  }

  const resultingStock = Math.max(0, Number((product.stock + (operationType === 'ajuste' ? delta : delta)).toFixed(3)));

  const handleTypeChange = (type: StockMovementType) => {
    setOperationType(type);
    if (type === 'compra') {
      setReason('Recepción de pedido de proveedor');
    } else if (type === 'merma') {
      setReason('Merma / Producto dañado o caducado');
    } else {
      setReason('Ajuste por conteo físico de inventario');
      setAmount(product.stock.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (operationType === 'ajuste') {
      const adjustmentDelta = parseFloat(amount) - product.stock;
      onAdjust(product.id, adjustmentDelta, 'ajuste', reason);
    } else {
      onAdjust(product.id, delta, operationType, reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h3 className="font-bold text-base">Ajuste de Stock / Movimiento</h3>
            <p className="text-xs text-slate-300 truncate max-w-xs">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stock Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-600 font-medium">Stock Actual en Sistema</span>
          <span className="text-sm font-bold font-mono text-slate-900">
            {product.stock} {product.unit}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Operation Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('compra')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  operationType === 'compra'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 mb-1 text-emerald-600" />
                <span>Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('merma')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  operationType === 'merma'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 mb-1 text-rose-600" />
                <span>Salida / Merma</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('ajuste')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  operationType === 'ajuste'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-4 h-4 mb-1 text-blue-600" />
                <span>Físico Real</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {operationType === 'compra'
                ? `Cantidad a Ingresar (${product.unit})`
                : operationType === 'merma'
                ? `Cantidad a Descontar (${product.unit})`
                : `Conteo Físico Real (${product.unit})`}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-lg font-bold font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Resulting Stock Preview */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600">Stock resultante después del movimiento:</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900">
              {resultingStock} {product.unit}
            </span>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo o Justificación del Movimiento
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Factura #8912 o empaque roto"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Movimiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
