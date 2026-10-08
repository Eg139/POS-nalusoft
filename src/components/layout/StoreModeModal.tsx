import React from 'react';
import { X, IceCream, ShoppingCart, Sparkles, Database, Trash2 } from 'lucide-react';
import { StoreMode } from '../../types';

interface Props {
  currentMode: StoreMode;
  onSelectMode: (mode: StoreMode) => void;
  onLoadDemo: (type: 'kiosko' | 'heladeria' | 'empty') => void;
  onClose: () => void;
}

export const StoreModeModal: React.FC<Props> = ({
  currentMode,
  onSelectMode,
  onLoadDemo,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h3 className="font-bold text-base">Tipo de Negocio</h3>
            <p className="text-xs text-slate-300">Cambia filtros y tema, no borra productos</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modos - NO borran */}
        <div className="p-6 space-y-3.5">
          <button
            type="button"
            onClick={() => onSelectMode('heladeria')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
              currentMode === 'heladeria'
              ? 'border-pink-600 bg-pink-50/70 ring-2 ring-pink-500/20'
                : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <IceCream className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Heladería Artesanal</h4>
                {currentMode === 'heladeria' && <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">Activo</span>}
              </div>
              <p className="text-xs text-slate-600 mt-1">Filtra sabores, presentaciones, insumos. Tema rosa.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('kiosko')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
              currentMode === 'kiosko'
              ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Kiosco & Almacén</h4>
                {currentMode === 'kiosko' && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Activo</span>}
              </div>
              <p className="text-xs text-slate-600 mt-1">Filtra golosinas, bebidas, snacks. Tema verde.</p>
            </div>
          </button>

          {/* Zona demo - SÍ borra, con confirm */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[10px] font-bold tracking-widest text-slate-400">DATOS DE PRUEBA</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => onLoadDemo('kiosko')} className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs flex items-center justify-between">
                <span>Usar datos demo Kiosco (12 prod)</span><span className="text-slate-400">→</span>
              </button>
              <button onClick={() => onLoadDemo('heladeria')} className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs flex items-center justify-between">
                <span>Usar datos demo Heladería (28 prod)</span><span className="text-slate-400">→</span>
              </button>
              <button onClick={() => onLoadDemo('empty')} className="w-full text-left p-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs text-red-600 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Vaciar catálogo (0 productos)
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">Cerrar</button>
        </div>
      </div>
    </div>
  );
};