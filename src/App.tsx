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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [settings, setSettings] = useState<SupermarketSettings | null>(null);

  // Global modals
  const [isCashSessionOpen, setIsCashSessionOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans antialiased text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        alertCount={alertCount}
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
