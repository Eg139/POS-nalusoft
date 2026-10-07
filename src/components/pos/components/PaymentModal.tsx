import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../../types';
import { CreditCard, Banknote, QrCode, Split, Check, X, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  total: number;
  subtotal: number;
  tax: number;
  onConfirm: (paymentMethod: PaymentMethod, amountPaid: number, change: number, notes?: string) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  total,
  subtotal,
  tax,
  onConfirm,
  onClose,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [cashGiven, setCashGiven] = useState<string>(total.toFixed(2));
  const [notes, setNotes] = useState<string>('');
  const [splitCash, setSplitCash] = useState<string>((total / 2).toFixed(2));

  const parsedCash = parseFloat(cashGiven) || 0;
  const change = Math.max(0, parsedCash - total);
  const isCashSufficient = parsedCash >= total - 0.009;

  const isFormValid = (() => {
    if (method === 'efectivo') return isCashSufficient;
    if (method === 'mixto') {
      const cashPart = parseFloat(splitCash) || 0;
      return cashPart > 0 && cashPart <= total;
    }
    return true;
  })();

  const handleSubmit = () => {
    if (!isFormValid) return;
    if (method === 'efectivo') {
      onConfirm('efectivo', parsedCash, change, notes);
    } else if (method === 'mixto') {
      const cashPart = parseFloat(splitCash) || 0;
      const cardPart = Math.max(0, total - cashPart);
      onConfirm('mixto', total, 0, `Efectivo: $${cashPart.toFixed(2)}, Tarjeta: $${cardPart.toFixed(2)}. ${notes}`);
    } else {
      onConfirm(method, total, 0, notes);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'Enter' && isFormValid) handleSubmit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormValid, method, parsedCash, splitCash, notes]);

  // Filtro lógico adaptado a Argentina: Muestra billetes superiores al total o los más comunes de baja denominación si aplica
  const denominations = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].filter(
    d => d >= total || (total < 1000 && d <= 1000)
  ).slice(0, 5); // Máximo 5 botones para no saturar

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header Limpio */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <h2 className="text-base font-semibold">Cobrar Venta</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Banner - Diseño Minimalista y Elegante */}
        <div className="bg-slate-50 px-6 py-5 text-center border-b border-slate-200">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total a Pagar</span>
          <div className="text-4xl font-black font-mono tracking-tight text-slate-900 my-1 tabular-nums">
            ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400">
            Subtotal: ${subtotal.toFixed(2)} · IVA: ${tax.toFixed(2)}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Selector de Método de Pago (Diseño minimalista en pestañas limpias) */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'efectivo', label: 'Efectivo', icon: Banknote },
              { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
              { id: 'transferencia', label: 'Transfer/QR', icon: QrCode },
              { id: 'mixto', label: 'Mixto', icon: Split },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = method === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id as PaymentMethod)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg transition-all text-xs font-medium ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="truncate w-full text-center">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bloque: Efectivo */}
          {method === 'efectivo' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-600">Efectivo Recibido</label>
                  <button
                    type="button"
                    onClick={() => setCashGiven(total.toFixed(2))}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    Monto Exacto
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">$</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    autoFocus
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 text-2xl font-bold font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Billetes rápidos contextuales */}
              {denominations.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {denominations.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashGiven(val.toFixed(2))}
                      className="flex-1 py-1.5 px-2 text-xs font-semibold font-mono bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                    >
                      ${val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              )}

              {/* Cambio a entregar (Estilo suelto y sobrio, sin verde chillón) */}
              <div>
                {isCashSufficient ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-xl">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Su Cambio</span>
                      <p className="text-2xl font-bold font-mono tabular-nums text-emerald-400">${change.toFixed(2)}</p>
                    </div>
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Faltan ${(total - parsedCash).toFixed(2)} para completar el pago.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bloque: Tarjeta o Transferencia */}
          {(method === 'tarjeta' || method === 'transferencia') && (
            <div className="space-y-3 py-2">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {method === 'tarjeta' ? '💳 Pase o inserte la tarjeta en la terminal POS.' : '📱 Verifique la transferencia o cobro por QR.'}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Referencia / Operación (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Nro de lote o comprobante"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {/* Bloque: Mixto */}
          {method === 'mixto' && (
            <div className="space-y-3 py-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Monto cubierto en Efectivo ($)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  max={total}
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  className="w-full px-3.5 py-2 text-base font-mono tabular-nums font-bold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex justify-between">
                <span>Restante a cobrar con Tarjeta:</span>
                <span className="font-bold font-mono tabular-nums text-slate-900">
                  ${Math.max(0, total - (parseFloat(splitCash) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancelar (Esc)
          </button>
          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleSubmit}
            className="w-2/3 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Pago</span>
          </button>
        </div>
      </div>
    </div>
  );
};