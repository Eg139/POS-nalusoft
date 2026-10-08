import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StorageService } from './services/storageService';
import { Product, Sale, StockMovement, CashSession, SupermarketSettings, StoreMode } from './types';
import { Navbar, AppView } from './components/layout/Navbar';
import { POSView } from './components/pos/POSView';
import { InventoryView } from './components/inventory/InventoryView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { RecipesView } from './components/production/RecipesView';
import { CashSessionModal } from './components/cashier/CashSessionModal';
import { SupabaseMigrationModal } from './components/settings/SupabaseMigrationModal';
import { StoreModeModal } from './components/layout/StoreModeModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [settings, setSettings] = useState<SupermarketSettings | null>(null);

  const [isCashSessionOpen, setIsCashSessionOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isStoreModeModalOpen, setIsStoreModeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadData = useCallback(() => {
    setProducts(StorageService.getProducts());
    setSales(StorageService.getSales());
    setMovements(StorageService.getStockMovements());
    setCashSession(StorageService.getCashSession());
    setSettings(StorageService.getSettings());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const alertCount = useMemo(() => {
    const today = new Date();
    const fifteenDays = new Date();
    fifteenDays.setDate(today.getDate() + 15);
    let count = 0;
    products.forEach((p) => {
      if (p.stock <= p.min_stock_alert) count++;
      else if (p.expiry_date && new Date(p.expiry_date) <= fifteenDays) count++;
    });
    return count;
  }, [products]);

  const isIceCreamMode = useMemo(() => {
    return settings?.store_mode === 'heladeria';
  }, [settings]);

  const handleSelectStoreMode = (mode: StoreMode) => {
    StorageService.setStoreMode(mode);
    loadData();
    setIsStoreModeModalOpen(false);
    showToast(mode === 'heladeria'? '🍨 Modo Heladería activado' : '🏪 Modo Kiosco activado');
  };

  const handleLoadDemo = (type: 'kiosko' | 'heladeria' | 'empty') => {
    if (!confirm('⚠️ Esto borrará tus productos actuales. ¿Continuar?')) return;
    if (type === 'heladeria') StorageService.loadIceCreamDemo();
    if (type === 'kiosko') StorageService.loadSupermarketDemo();
    if (type === 'empty') StorageService.loadEmptyCatalog();
    loadData();
    setIsStoreModeModalOpen(false);
    // reload solo si vaciamos, para limpiar estados del POS
    if (type === 'empty') window.location.reload();
    else showToast(type === 'heladeria'? '🍨 Demo Heladería cargada' : type === 'kiosko'? '🏪 Demo Kiosco cargada' : '✨ Catálogo vaciado');
  };

  if (!settings ||!cashSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Iniciando SuperPOS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans antialiased text-slate-900 relative">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        alertCount={alertCount}
        isIceCreamMode={isIceCreamMode}
        onToggleStoreMode={() => setIsStoreModeModalOpen(true)}
        onOpenCashSession={() => setIsCashSessionOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'pos' && <POSView products={products} settings={settings} onRefreshData={loadData} onNavigateToStock={() => setCurrentView('inventory')} />}
        {currentView === 'inventory' && <InventoryView products={products} onRefreshData={loadData} onNavigateToPOS={() => setCurrentView('pos')} />}
        {currentView === 'production' && <RecipesView products={products} onRefreshData={loadData} onUpdateProductRecipe={(productId, recipe, hasRecipe) => { StorageService.updateProductRecipe(productId, recipe, hasRecipe); loadData(); showToast('¡Receta guardada!'); }} />}
        {currentView === 'alerts' && <AlertsView products={products} movements={movements} onRefreshData={loadData} onNavigateToInventory={() => setCurrentView('inventory')} />}
        {currentView === 'reports' && <ReportsView sales={sales} products={products} />}
      </main>

      {isStoreModeModalOpen && (
        <StoreModeModal
          currentMode={settings.store_mode}
          onSelectMode={handleSelectStoreMode}
          onLoadDemo={handleLoadDemo}
          onClose={() => setIsStoreModeModalOpen(false)}
        />
      )}

      {isCashSessionOpen && <CashSessionModal session={cashSession} onRefreshData={loadData} onClose={() => setIsCashSessionOpen(false)} />}
      {isSupabaseModalOpen && <SupabaseMigrationModal settings={settings} onUpdateSettings={setSettings} onRefreshData={loadData} onClose={() => setIsSupabaseModalOpen(false)} />}
    </div>
  );
}