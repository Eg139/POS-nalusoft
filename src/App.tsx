import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StorageService } from './services/storageService';
import { Product, Sale, StockMovement, CashSession, SupermarketSettings } from './types';
import { Navbar, AppView } from './components/layout/Navbar';
import { POSView } from './components/pos/POSView';
import { InventoryView } from './components/inventory/InventoryView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
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

  // Global modals & notifications
  const [isCashSessionOpen, setIsCashSessionOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isStoreModeModalOpen, setIsStoreModeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show in-app notification toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Load data from LocalStorage
  const loadData = useCallback(() => {
    const loadedProducts = StorageService.getProducts();
    const loadedSales = StorageService.getSales();
    const loadedMovements = StorageService.getStockMovements();
    const loadedSession = StorageService.getCashSession();
    const loadedSettings = StorageService.getSettings();

    setProducts(loadedProducts);
    setSales(loadedSales);
    setMovements(loadedMovements);
    setCashSession(loadedSession);
    setSettings(loadedSettings);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute alert count for navbar badge
  const alertCount = useMemo(() => {
    const today = new Date();
    const fifteenDays = new Date();
    fifteenDays.setDate(today.getDate() + 15);

    let count = 0;
    products.forEach((p) => {
      if (p.stock <= p.min_stock_alert) {
        count++;
      } else if (p.expiry_date && new Date(p.expiry_date) <= fifteenDays) {
        count++;
      }
    });
    return count;
  }, [products]);

  // Detect if store is currently running Heladería or Supermercado
  const isIceCreamMode = useMemo(() => {
    if (!settings) return false;
    return (
      settings.store_name.toLowerCase().includes('gelato') ||
      settings.store_name.toLowerCase().includes('helad') ||
      products.some((p) => p.category.toLowerCase().includes('helad'))
    );
  }, [settings, products]);

  // Handle store mode selection from modal
  const handleSelectStoreMode = (mode: 'supermarket' | 'icecream' | 'empty') => {
    if (mode === 'icecream') {
      StorageService.loadIceCreamDemo();
      loadData();
      setIsStoreModeModalOpen(false);
      showToast('🍨 Modo Heladería Artesanal activado (21 productos cargados)');
    } else if (mode === 'supermarket') {
      StorageService.loadSupermarketDemo();
      loadData();
      setIsStoreModeModalOpen(false);
      showToast('🛒 Modo Supermercado activado (27 productos cargados)');
    } else {
      StorageService.clearAllData('Mi Heladería');
      loadData();
      setIsStoreModeModalOpen(false);
      showToast('✨ Catálogo limpiado. Ahora puedes registrar tus propios productos.');
    }
  };

  if (!settings || !cashSession) {
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        alertCount={alertCount}
        isIceCreamMode={isIceCreamMode}
        onToggleStoreMode={() => setIsStoreModeModalOpen(true)}
        onOpenCashSession={() => setIsCashSessionOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'pos' && (
          <POSView
            products={products}
            settings={settings}
            onRefreshData={loadData}
            onNavigateToStock={() => setCurrentView('inventory')}
          />
        )}

        {currentView === 'inventory' && (
          <InventoryView
            products={products}
            onRefreshData={loadData}
            onNavigateToPOS={() => setCurrentView('pos')}
          />
        )}

        {currentView === 'alerts' && (
          <AlertsView
            products={products}
            movements={movements}
            onRefreshData={loadData}
            onNavigateToInventory={() => setCurrentView('inventory')}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView sales={sales} products={products} />
        )}
      </main>

      {/* Global Store Mode Switcher Modal */}
      {isStoreModeModalOpen && (
        <StoreModeModal
          currentMode={isIceCreamMode ? 'icecream' : 'supermarket'}
          onSelectMode={handleSelectStoreMode}
          onClose={() => setIsStoreModeModalOpen(false)}
        />
      )}

      {/* Global Arqueo de Caja Modal */}
      {isCashSessionOpen && (
        <CashSessionModal
          session={cashSession}
          onRefreshData={loadData}
          onClose={() => setIsCashSessionOpen(false)}
        />
      )}

      {/* Global Supabase Migration & Storage Modal */}
      {isSupabaseModalOpen && (
        <SupabaseMigrationModal
          settings={settings}
          onUpdateSettings={setSettings}
          onRefreshData={loadData}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      )}
    </div>
  );
}
