import React, { useState } from 'react';
import { Product, StockMovement } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingDown,
  ArrowUpRight,
  PackageX,
  History,
  ShieldAlert,
  ArrowDownRight
} from 'lucide-react';

interface AlertsViewProps {
  products: Product[];
  movements: StockMovement[];
  onRefreshData: () => void;
  onNavigateToInventory: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  products,
  movements,
  onRefreshData,
  onNavigateToInventory,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'expiry' | 'kardex'>('stock');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Low & Out of stock products
  const lowStockProducts = products
    .filter((p) => p.stock <= p.min_stock_alert)
    .sort((a, b) => a.stock - b.stock);

  // Expiring perishables
  const expiringProducts = products
    .filter((p) => {
      if (!p.expiry_date) return false;
      const expDate = new Date(p.expiry_date);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 20; // 20 days or expired
    })
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());

  // Quick 1-click replenish
  const handleQuickRestock = (product: Product) => {
    // Recommend quantity to reach 2x min_stock
    const suggestedRestock = Math.max(10, Math.ceil(product.min_stock_alert * 2 - product.stock));
    StorageService.adjustStock(
      product.id,
      suggestedRestock,
      'compra',
      `Reabastecimiento rápido por alarma de stock (+${suggestedRestock} ${product.unit})`
    );
    setSuccessToast(`Se agregaron ${suggestedRestock} ${product.unit} a ${product.name}`);
    setTimeout(() => setSuccessToast(null), 3000);
    onRefreshData();
  };

  // Quick mark as waste for expired
  const handleMarkWaste = (product: Product) => {
    if (product.stock <= 0) return;
    StorageService.adjustStock(
      product.id,
      -product.stock,
      'merma',
      `Baja total por vencimiento de fecha (${product.expiry_date})`
    );
    setSuccessToast(`Merma de ${product.stock} ${product.unit} registrada para ${product.name}`);
    setTimeout(() => setSuccessToast(null), 3000);
    onRefreshData();
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-50">
      {/* Toast */}
      {successToast && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Centro de Alarmas de Stock y Caducidad</h2>
          <p className="text-xs text-slate-500">
            Monitoreo en tiempo real de faltantes en góndola y productos perecederos próximos a vencer.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'stock'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Stock Bajo ({lowStockProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('expiry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'expiry'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Vencimientos ({expiringProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('kardex')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'kardex'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial Kardex</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LOW STOCK ALARMS */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {lowStockProducts.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Inventario en Niveles Óptimos</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No hay productos con existencias por debajo del umbral mínimo de seguridad.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const deficit = Math.max(0, p.min_stock_alert - p.stock);
                const suggestedOrder = Math.max(10, Math.ceil(p.min_stock_alert * 2 - p.stock));

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border bg-white shadow-xs flex flex-col justify-between ${
                      isOutOfStock ? 'border-rose-300 ring-1 ring-rose-200' : 'border-amber-300'
                    }`}
                  >
                    <div>
                      {/* Urgency Badge */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        {isOutOfStock ? (
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <PackageX className="w-3.5 h-3.5" />
                            <span>AGOTADO (0 {p.unit})</span>
                          </span>
                        ) : (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>STOCK CRÍTICO</span>
                          </span>
                        )}
                        <span className="font-mono text-slate-400 text-[10px]">{p.barcode}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>

                      <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Stock Actual:</span>
                          <span className="font-bold font-mono text-slate-900 tabular-nums">
                            {p.stock} {p.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mínimo Permitido:</span>
                          <span className="font-mono text-slate-700 tabular-nums">
                            {p.min_stock_alert} {p.unit}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 text-rose-700 font-semibold">
                          <span>Déficit de anaquel:</span>
                          <span className="font-mono tabular-nums">
                            -{deficit} {p.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Sugerido: <strong className="text-slate-800">+{suggestedOrder} {p.unit}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickRestock(p)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reabastecer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPIRATION ALARMS */}
      {activeTab === 'expiry' && (
        <div className="space-y-4">
          {expiringProducts.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Sin Caducidades Críticas</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No hay productos perecederos próximos a vencer en los siguientes 20 días.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiringProducts.map((p) => {
                const expDate = new Date(p.expiry_date!);
                const diffTime = expDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isExpired = diffDays <= 0;

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border bg-white shadow-xs flex flex-col justify-between ${
                      isExpired ? 'border-rose-400 bg-rose-50/20' : 'border-amber-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        {isExpired ? (
                          <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            ¡VENCIDO HACE {Math.abs(diffDays)} DÍAS!
                          </span>
                        ) : (
                          <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Vence en {diffDays} {diffDays === 1 ? 'día' : 'días'}
                          </span>
                        )}
                        <span className="font-mono text-slate-400 text-[10px]">
                          {p.batch_number ? `Lote: ${p.batch_number}` : p.barcode}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>

                      <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fecha de Vencimiento:</span>
                          <span className="font-bold font-mono text-slate-900">{p.expiry_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Stock Comprometido:</span>
                          <span className="font-mono text-slate-800 tabular-nums">
                            {p.stock} {p.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pérdida Potencial:</span>
                          <span className="font-bold font-mono text-rose-700 tabular-nums">
                            ${(p.stock * p.cost_price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      {isExpired ? (
                        <button
                          type="button"
                          onClick={() => handleMarkWaste(p)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>Dar de Baja (Merma)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onNavigateToInventory}
                          className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                          Descuento / Liquidación
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KARDEX MOVEMENTS HISTORY */}
      {activeTab === 'kardex' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">Kardex / Registro de Movimientos de Inventario</h3>
            <span className="text-xs text-slate-500">{movements.length} movimientos registrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-4">Fecha/Hora</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-4">Producto</th>
                  <th className="py-2.5 px-3 text-right">Cant. Movimiento</th>
                  <th className="py-2.5 px-3 text-right">Stock Anterior</th>
                  <th className="py-2.5 px-3 text-right">Stock Resultante</th>
                  <th className="py-2.5 px-4">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No hay movimientos registrados aún.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString('es-MX')}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {m.type === 'compra' && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                            Entrada
                          </span>
                        )}
                        {m.type === 'venta' && (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                            Venta
                          </span>
                        )}
                        {m.type === 'merma' && (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                            Merma
                          </span>
                        )}
                        {m.type === 'ajuste' && (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                            Ajuste
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{m.product_name}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                          m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                        {m.previous_stock}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-800">
                        {m.new_stock}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{m.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
