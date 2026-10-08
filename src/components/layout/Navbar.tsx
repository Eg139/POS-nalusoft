import React from 'react';
import { ShoppingCart, Package, AlertTriangle, BarChart3, Vault, Database, ChefHat, IceCream, Store } from 'lucide-react';

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

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  alertCount,
  isIceCreamMode = false,
  onToggleStoreMode,
  onOpenCashSession,
  onOpenSupabaseModal,
}) => {
  return (
    <header className="h-[65px] bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between select-none shrink-0 z-40">
      {/* Zone 1: Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectView('pos');
        }}
        className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center font-mono">
          S
        </span>
        <span className="text-white">SuperPOS</span>
      </a>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onSelectView('pos')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            currentView === 'pos'
             ? 'bg-slate-800 text-emerald-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Venta</span>
        </button>

        <button
          onClick={() => onSelectView('inventory')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            currentView === 'inventory'
             ? 'bg-slate-800 text-emerald-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventario</span>
        </button>

        {isIceCreamMode && (
          <button
            onClick={() => onSelectView('production')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === 'production'
               ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ChefHat className="w-4 h-4 text-emerald-400" />
            <span>Producción</span>
          </button>
        )}

        <button
          onClick={() => onSelectView('alerts')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors relative ${
            currentView === 'alerts'
             ? 'bg-slate-800 text-amber-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Alarmas</span>
          {alertCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectView('reports')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            currentView === 'reports'
             ? 'bg-slate-800 text-emerald-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Reportes</span>
        </button>
      </nav>

      {/* Zone 3: Primary actions */}
      <div className="flex items-center gap-2">
        {onToggleStoreMode && (
          <button
            onClick={onToggleStoreMode}
            title={isIceCreamMode? 'Cambiar a modo Kiosco' : 'Cambiar a modo Heladería'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
              isIceCreamMode
               ? 'bg-pink-950/40 text-pink-300 border-pink-700/60 hover:bg-pink-900/60'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
            }`}
          >
            {isIceCreamMode? (
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
          onClick={onOpenCashSession}
          title="Arqueo y Corte de Caja"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors whitespace-nowrap"
        >
          <Vault className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Caja</span>
        </button>

        <button
          onClick={onOpenSupabaseModal}
          title="Migración Supabase y Respaldos"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors whitespace-nowrap shadow-xs"
        >
          <Database className="w-4 h-4" />
          <span className="hidden md:inline">Supabase</span>
        </button>
      </div>
    </header>
  );
};