import React from 'react';
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
  X,
} from 'lucide-react';
import type { AppView } from './Navbar';

interface MobileNavDrawerProps {
  isOpen: boolean;
  currentView: AppView;
  alertCount: number;
  isIceCreamMode: boolean;
  onClose: () => void;
  onSelectView: (view: AppView) => void;
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

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  currentView,
  alertCount,
  isIceCreamMode,
  onClose,
  onSelectView,
  onToggleStoreMode,
  onOpenCashSession,
  onOpenSupabaseModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      <aside className="relative w-72 max-w-[85vw] bg-slate-900 text-white h-full shadow-2xl border-r border-slate-800 flex flex-col z-10">
        <div className="h-[65px] px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center font-mono">
              S
            </span>
            <span className="font-extrabold tracking-tight text-base">SuperPOS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Módulos</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = currentView === id;
            const activeClass = id === 'alerts' ? 'bg-slate-800 text-amber-400' : 'bg-slate-800 text-emerald-400';
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onSelectView(id);
                  onClose();
                }}
                className={`w-full min-h-[44px] flex items-center justify-between px-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? activeClass : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </span>
                {id === 'alerts' && alertCount > 0 && (
                  <span className="px-2 h-5 rounded-full bg-rose-600 text-white font-mono tabular-nums text-[11px] font-bold flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2 shrink-0">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Administración</p>
          {onToggleStoreMode && (
            <button
              type="button"
              onClick={() => {
                onToggleStoreMode();
                onClose();
              }}
              className={`w-full min-h-[44px] flex items-center gap-3 px-3 rounded-lg text-xs font-bold border ${
                isIceCreamMode
                  ? 'bg-pink-950/40 text-pink-300 border-pink-700/60'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
              }`}
            >
              {isIceCreamMode ? (
                <>
                  <IceCream className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Modo: Heladería</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Modo: Kiosco</span>
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onOpenCashSession();
              onClose();
            }}
            className="w-full min-h-[44px] flex items-center gap-3 px-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700"
          >
            <Vault className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Arqueo y Caja</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenSupabaseModal();
              onClose();
            }}
            className="w-full min-h-[44px] flex items-center gap-3 px-3 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>Supabase y Respaldos</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
