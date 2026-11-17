import React, { useState } from 'react';
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  BarChart3,
  Vault,
  Database,
  ChefHat,
  IceCream,
  Store,
  Menu,
} from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';

export type AppView = 'pos' | 'inventory' | 'alerts' | 'reports' | 'production';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  alertCount: number;
  isIceCreamMode?: boolean;
  onToggleStoreMode?: () => void;
  onOpenCashSession: () => void;
  onOpenSupabaseModal: () => void;
}

const NAV_ITEMS: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pos', label: 'Venta', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'production', label: 'Producción', icon: ChefHat },
  { id: 'alerts', label: 'Alarmas', icon: AlertTriangle },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  alertCount,
  isIceCreamMode = false,
  onToggleStoreMode,
  onOpenCashSession,
  onOpenSupabaseModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-[65px] bg-slate-900 border-b border-slate-800 px-3 md:px-6 flex items-center justify-between gap-2 select-none shrink-0 z-40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menú de navegación"
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectView('pos');
            }}
            className="text-base md:text-lg font-extrabold tracking-tight text-white flex items-center gap-2 hover:opacity-90 shrink-0 whitespace-nowrap"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center font-mono">
              S
            </span>
            <span className="text-white">SuperPOS</span>
          </a>
        </div>

        <nav className="hidden md:flex items-center gap-1 min-w-0">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = currentView === id;
            const activeClass = id === 'alerts' ? 'bg-slate-800 text-amber-400' : 'bg-slate-800 text-emerald-400';
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectView(id)}
                className={`min-h-[44px] flex items-center justify-center gap-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive ? activeClass : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {id === 'alerts' && alertCount > 0 && (
                  <span className="px-1.5 h-5 rounded-full bg-rose-600 text-white font-mono tabular-nums text-[10px] font-bold flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {onToggleStoreMode && (
            <button
              type="button"
              onClick={onToggleStoreMode}
              title={isIceCreamMode ? 'Cambiar a modo Kiosco' : 'Cambiar a modo Heladería'}
              className={`min-h-[44px] hidden md:flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap border ${
                isIceCreamMode
                  ? 'bg-pink-950/40 text-pink-300 border-pink-700/60 hover:bg-pink-900/60'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
              }`}
            >
              {isIceCreamMode ? (
                <>
                  <IceCream className="w-4 h-4 text-pink-400" />
                  <span>Heladería</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Kiosco</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCashSession}
            title="Arqueo y Corte de Caja"
            className="min-h-[44px] hidden md:flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 whitespace-nowrap"
          >
            <Vault className="w-4 h-4 text-emerald-400" />
            <span>Caja</span>
          </button>

          <button
            type="button"
            onClick={onOpenSupabaseModal}
            title="Migración Supabase y Respaldos"
            className="min-h-[44px] hidden md:flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 whitespace-nowrap shadow-xs"
          >
            <Database className="w-4 h-4" />
            <span className="hidden xl:inline">Supabase</span>
          </button>

          <span className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
            {isIceCreamMode ? (
              <>
                <IceCream className="w-3.5 h-3.5 text-pink-400" />
                <span>Heladería</span>
              </>
            ) : (
              <>
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kiosco</span>
              </>
            )}
          </span>
        </div>
      </header>

      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        currentView={currentView}
        alertCount={alertCount}
        isIceCreamMode={isIceCreamMode}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectView={onSelectView}
        onToggleStoreMode={onToggleStoreMode}
        onOpenCashSession={onOpenCashSession}
        onOpenSupabaseModal={onOpenSupabaseModal}
      />
    </>
  );
};