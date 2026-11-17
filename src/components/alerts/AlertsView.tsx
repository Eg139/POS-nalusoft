import React, { useState, useMemo } from 'react';
import { Product, StockMovement } from '../../types';
import { StorageService } from '../../services/storageService';
import { Clock, CheckCircle2, History, ShieldAlert } from 'lucide-react';
import { AlertsStockTab } from './AlertsStockTab';
import { AlertsExpiryTab } from './AlertsExpiryTab';
import { AlertsKardexTab } from './AlertsKardexTab';

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

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.stock <= p.min_stock_alert)
      .sort((a, b) => a.stock - b.stock);
  }, [products]);

  const expiringProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.expiry_date) return false;
        const expDate = new Date(p.expiry_date);
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 20;
      })
      .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());
  }, [products, today]);

  const handleQuickRestock = (product: Product) => {
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

  const handleMarkWaste = (product: Product) => {
    if (product.stock <= 0) {
      setSuccessToast(`El producto ${product.name} ya se encuentra en stock 0.`);
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
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
      {successToast && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Centro de Alarmas de Stock y Caducidad</h2>
          <p className="text-xs text-slate-500">
            Monitoreo de faltantes en góndola y productos perecederos próximos a vencer.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs overflow-x-auto w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`min-h-[40px] flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'stock' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Stock ({lowStockProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expiry')}
            className={`min-h-[40px] flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'expiry' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Vencimientos ({expiringProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kardex')}
            className={`min-h-[40px] flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'kardex' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>Kardex</span>
          </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <AlertsStockTab lowStockProducts={lowStockProducts} onQuickRestock={handleQuickRestock} />
      )}

      {activeTab === 'expiry' && (
        <AlertsExpiryTab
          expiringProducts={expiringProducts}
          today={today}
          onMarkWaste={handleMarkWaste}
          onNavigateToInventory={onNavigateToInventory}
        />
      )}

      {activeTab === 'kardex' && <AlertsKardexTab movements={movements} />}
    </div>
  );
};