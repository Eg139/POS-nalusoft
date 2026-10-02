import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../types';
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

  // Keyboard shortcut: Esc to cancel, Enter to submit if valid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (method === 'efectivo' && isCashSufficient) {
          handleSubmit();
        } else if (method !== 'efectivo') {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [method, isCashSufficient, cashGiven]);

  const setExactCash = () => {
    setCashGiven(total.toFixed(2));
  };

  const addCashPreset = (amount: number) => {
    setCashGiven(amount.toFixed(2));
  };

  const handleSubmit = () => {
    if (method === 'efectivo') {
      if (!isCashSufficient) return;
      onConfirm('efectivo', parsedCash, change, notes);
    } else if (method === 'mixto') {
      const cashPart = parseFloat(splitCash) || 0;
      const cardPart = Math.max(0, total - cashPart);
      onConfirm('mixto', total, 0, `Efectivo: $${cashPart.toFixed(2)}, Tarjeta: $${cardPart.toFixed(2)}. ${notes}`);
    } else {
      onConfirm(method, total, 0, notes);
    }
  };

  const denominations = [20, 50, 100, 200, 500, 1000].filter(d => d >= total || d >= 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h2 className="text-lg font-bold">Cobrar Venta</h2>
            <p className="text-xs text-slate-300">Selecciona la forma de pago y confirma el importe</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Banner */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-600">Total a Pagar</span>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              ${total.toFixed(2)}
            </span>
            <div className="text-xs text-slate-400 mt-0.5">
              Subtotal: ${subtotal.toFixed(2)} · IVA: ${tax.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Forma de Pago
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethod('efectivo')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  method === 'efectivo'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('tarjeta')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  method === 'tarjeta'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-blue-600" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('transferencia')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  method === 'transferencia'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-indigo-600" />
                <span>Transf. / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('mixto')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  method === 'mixto'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Split className="w-5 h-5 mb-1 text-amber-600" />
                <span>Mixto</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {method === 'efectivo' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Monto Recibido</label>
                  <button
                    type="button"
                    onClick={setExactCash}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Monto Exacto (${total.toFixed(2)})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    autoFocus
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-xl font-bold font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-1.5">
                {denominations.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => addCashPreset(val)}
                    className="px-2.5 py-1 text-xs font-semibold font-mono bg-white hover:bg-slate-200 border border-slate-300 rounded-md text-slate-700 transition-colors"
                  >
                    ${val}
                  </button>
                ))}
              </div>

              {/* Real-time Cambio calculation */}
              <div className="pt-2 border-t border-slate-200">
                {isCashSufficient ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-100/70 border border-emerald-300 rounded-lg text-emerald-900">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-emerald-800">Cambio a Entregar</span>
                      <p className="text-2xl font-bold font-mono tabular-nums">${change.toFixed(2)}</p>
                    </div>
                    <Check className="w-6 h-6 text-emerald-700" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Faltan ${(total - parsedCash).toFixed(2)} para cubrir el total.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card / Transfer Reference */}
          {(method === 'tarjeta' || method === 'transferencia') && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>
                  {method === 'tarjeta'
                    ? 'Procesar cargo en terminal por $' + total.toFixed(2)
                    : 'Verificar comprobante SPEI / CoDi por $' + total.toFixed(2)}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  N° de Autorización o Referencia (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. AUT-89421 o Clave de rastreo"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Split Payment */}
          {method === 'mixto' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs text-slate-600">Divide el pago entre efectivo y tarjeta:</p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Parte en Efectivo ($)</label>
                <input
                  type="number"
                  step="1"
                  max={total}
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  className="w-full px-3 py-2 text-base font-mono tabular-nums font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex justify-between">
                <span>Resta en Tarjeta:</span>
                <span className="font-bold font-mono tabular-nums">
                  ${Math.max(0, total - (parseFloat(splitCash) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar (Esc)
          </button>
          <button
            type="button"
            disabled={method === 'efectivo' && !isCashSufficient}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            Confirmar y Emitir Ticket (Enter)
          </button>
        </div>
      </div>
    </div>
  );
};
