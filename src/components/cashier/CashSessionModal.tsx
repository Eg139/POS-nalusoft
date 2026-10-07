import React, { useState } from 'react';
import { CashSession } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  Vault,
  X,
  CheckCircle2,
  AlertCircle,
  Calculator
} from 'lucide-react';

interface CashSessionModalProps {
  session: CashSession;
  onRefreshData: () => void;
  onClose: () => void;
}

export const CashSessionModal: React.FC<CashSessionModalProps> = ({
  session,
  onRefreshData,
  onClose,
}) => {
  const [actualCash, setActualCash] = useState<string>(session.expected_cash.toFixed(2));
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalReason, setWithdrawalReason] = useState<string>('');
  const [isOpeningNew, setIsOpeningNew] = useState<boolean>(false);
  const [newCashier, setNewCashier] = useState<string>('Cajero 01 - Eric G.');
  const [newInitialCash, setNewInitialCash] = useState<string>('1000.00');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedActual = parseFloat(actualCash) || 0;
  const difference = Number((parsedActual - session.expected_cash).toFixed(2));

  // Handle cash withdrawal (retiro de efectivo / pago a proveedor)
  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmount) || 0;
    
    if (amount <= 0 || amount > session.expected_cash) {
      setErrorMessage('Monto de retiro inválido o excede el efectivo en caja.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const updated: CashSession = {
      ...session,
      cash_withdrawals: session.cash_withdrawals + amount,
      expected_cash: session.expected_cash - amount,
    };
    StorageService.updateCashSession(updated);
    setWithdrawalAmount('');
    setWithdrawalReason('');
    setErrorMessage(null);
    onRefreshData();
  };

  // Close session (Corte Z)
  const handleCloseSession = () => {
    StorageService.closeCashSession(parsedActual);
    onRefreshData();
    setIsOpeningNew(true);
  };

  // Open new shift
  const handleOpenNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    const initial = parseFloat(newInitialCash) || 0;
    StorageService.openNewCashSession(newCashier, initial);
    onRefreshData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Vault className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Control de Caja y Arqueo (Corte)</h3>
              <p className="text-xs text-slate-300">
                Estado: {session.status === 'abierta' ? '🟢 Turno Abierto' : '🔴 Turno Cerrado'} · {session.cashier_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isOpeningNew || session.status === 'cerrada' ? (
          <form onSubmit={handleOpenNewSession} className="p-6 space-y-4">
            <div className="text-center py-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-base">Apertura de Nuevo Turno de Caja</h4>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa el fondo inicial de cambio en caja para habilitar el cobro.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Cajero</label>
              <input
                type="text"
                required
                value={newCashier}
                onChange={(e) => setNewCashier(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fondo Inicial en Efectivo ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={newInitialCash}
                onChange={(e) => setNewInitialCash(e.target.value)}
                className="w-full px-3 py-2 text-lg font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Abrir Turno de Caja
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-5">
            {/* Shift Breakdown Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Fondo Inicial de Apertura:</span>
                <span className="font-mono tabular-nums font-bold text-slate-800">
                  ${session.initial_cash.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>(+) Ventas Cobradas en Efectivo:</span>
                <span className="font-mono tabular-nums font-bold text-emerald-700">
                  +${session.cash_sales.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>(-) Retiros / Gastos de Caja:</span>
                <span className="font-mono tabular-nums font-bold text-rose-700">
                  -${session.cash_withdrawals.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Efectivo Teórico Esperado en Cajón:</span>
                <span className="font-extrabold font-mono tabular-nums text-slate-900 text-lg">
                  ${session.expected_cash.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Other Payment Methods (Reference Only) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="text-blue-800 font-medium">Ventas Tarjeta (Terminal)</span>
                <p className="font-mono font-bold text-blue-900 text-base mt-0.5">
                  ${session.card_sales.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg">
                <span className="text-indigo-800 font-medium">Ventas SPEI / QR</span>
                <p className="font-mono font-bold text-indigo-900 text-base mt-0.5">
                  ${session.transfer_sales.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Retiro de Efectivo Form */}
            <form onSubmit={handleWithdrawal} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Registrar Retiro de Efectivo / Gasto Menor</span>
              
              {errorMessage && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={session.expected_cash}
                  placeholder="Monto ($)"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-28 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Motivo (Ej. Pago de garrafones, proveedor de pan)"
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={!withdrawalAmount}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 rounded-lg"
                >
                  Registrar
                </button>
              </div>
            </form>

            {/* Real Arqueo Count & Difference */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950">
                    Conteo Físico para Arqueo / Cierre
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Cuenta billetes y monedas en el cajón e ingresa el total físico:
                  </p>
                </div>
                <Calculator className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-xl font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Difference Status */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200 text-xs">
                <span>Diferencia de Caja:</span>
                <span
                  className={`font-mono font-bold text-sm tabular-nums ${
                    difference === 0
                      ? 'text-emerald-700'
                      : difference > 0
                      ? 'text-blue-700'
                      : 'text-rose-700'
                  }`}
                >
                  {difference === 0
                    ? '$0.00 (Caja Cuadrada Exacta)'
                    : difference > 0
                    ? `+$${difference.toFixed(2)} (Sobrante)`
                    : `-$${Math.abs(difference).toFixed(2)} (Faltante)`}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Continuar Turno
              </button>
              <button
                type="button"
                onClick={handleCloseSession}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                <Vault className="w-4 h-4" />
                <span>Efectuar Corte Z y Cerrar Caja</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};