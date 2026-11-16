import React from 'react';
import { Calendar, Clock, SlidersHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface IceCreamFlavorCardProps {
  flavor: Product;
  onAdjust: (flavor: Product) => void;
  onEdit: (flavor: Product) => void;
  onDelete: (id: string) => void;
}

export const IceCreamFlavorCard: React.FC<IceCreamFlavorCardProps> = ({
  flavor,
  onAdjust,
  onEdit,
  onDelete,
}) => {
  const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');
  const isCritical = flavor.stock > 0 && flavor.stock <= flavor.min_stock_alert;
  const isOut = flavor.stock <= 0;
  const percentRemaining = Math.min(100, Math.round((flavor.stock / 15) * 100));

  const daysSinceMfg = flavor.manufacturing_date
    ? Math.max(0, Math.floor((Date.now() - new Date(flavor.manufacturing_date).getTime()) / 86400000))
    : null;

  return (
    <div
      className={`p-4 bg-white rounded-2xl border-2 transition-all shadow-xs flex flex-col justify-between gap-3 ${
        isOut ? 'border-rose-300 bg-rose-50/20' : isCritical ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-pink-300'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🍧</span>
              <h4 className="font-extrabold text-sm text-slate-900 truncate">{cleanName}</h4>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {flavor.batch_number ? (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                  Lote: {flavor.batch_number}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">Sin lote</span>
              )}
              <span className="text-[10px] text-slate-400 font-mono">{flavor.barcode}</span>
            </div>
          </div>

          {isOut ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 shrink-0">Agotado</span>
          ) : isCritical ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">Bacha Baja</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">En Existencia</span>
          )}
        </div>

        <div className="mt-3.5 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-600">Stock en Bacha:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-slate-900 tabular-nums">{flavor.stock.toFixed(1)}</span>
              <span className="text-xs font-bold text-slate-500 font-mono">/ 15 kg</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
            <div
              className={`h-full rounded-full transition-all ${
                isOut ? 'bg-rose-500 w-0' : isCritical ? 'bg-amber-500' : 'bg-gradient-to-r from-pink-500 to-rose-500'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Equivale a ~{Math.floor((flavor.stock * 1000) / 160)} conos dobles</span>
            <span className="font-mono font-bold">{percentRemaining}% capacidad</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Fabricado:</span>
            </span>
            <span className="font-semibold text-blue-900">
              {flavor.manufacturing_date || 'No registrada'}
              {daysSinceMfg !== null && (
                <span className="ml-1 text-[10px] text-slate-400 font-normal">
                  (hace {daysSinceMfg} {daysSinceMfg === 1 ? 'día' : 'días'})
                </span>
              )}
            </span>
          </div>
          {flavor.expiry_date && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Caducidad:</span>
              </span>
              <span className="font-semibold text-slate-700">{flavor.expiry_date}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => onAdjust(flavor)}
          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Ajustar / Rellenar</span>
        </button>
        <button type="button" onClick={() => onEdit(flavor)} title="Editar lote" className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
          <Edit2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onDelete(flavor.id)} title="Eliminar sabor" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
