import React, { useState, useMemo } from 'react';
import { X, Check, Plus, Minus, Search, Utensils, RotateCcw, IceCream, Layers, AlertTriangle, Package, Trash2 } from 'lucide-react';
import { Product, SelectedFlavorItem, SelectedSupplyItem } from '../../../types';
import { useIceCreamModal } from '../hooks/useIceCreamModal';

interface IceCreamFlavorModalProps {
  product: Product;
  availableProducts: Product[];
  onConfirm: (flavors: SelectedFlavorItem[], supplies: SelectedSupplyItem[]) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'Todos', label: 'Todos' },
  { id: 'crema', label: 'Cremas' },
  { id: 'choc', label: 'Chocolates' },
  { id: 'dulce', label: 'DDL' },
  { id: 'frut', label: 'Frutales' },
];

export const IceCreamFlavorModal: React.FC<IceCreamFlavorModalProps> = ({
  product,
  availableProducts,
  onConfirm,
  onClose,
}) => {
  const {
    maxFlavors,
    totalGrams,
    slotGrams,
    flavorSearch,
    setFlavorSearch,
    filteredFlavors,
    slots,
    activeSlotIndex,
    setActiveSlotIndex,
    supplies,
    filledSlotsCount,
    consolidatedFlavors,
    totalAssignedGrams,
    handleSelectFlavor,
    handleFillAllWithFlavor,
    handleClearSlot,
    handleResetSlots,
    handleUpdateSupplyQty,
    handleAddExtraSupply,
    handleConfirmOrder,
  } = useIceCreamModal(product, availableProducts, onConfirm);

  const [catFilter, setCatFilter] = useState('Todos');

  const displayFlavors = useMemo(() => {
    let list = filteredFlavors;
    if (catFilter!== 'Todos') {
      list = list.filter((f: any) =>
        f.name.toLowerCase().includes(catFilter) ||
        f.category?.toLowerCase().includes(catFilter)
      );
    }
    return list;
  }, [filteredFlavors, catFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-[2px] p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[980px] w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">

        {/* HEADER - SuperPOS dark */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
              <IceCream className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[15px] tracking-tight truncate">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="bg-white/10 px-2 py-0.5 rounded-full font-mono font-bold text-white">{totalGrams}g totales</span>
                <span>•</span>
                <span>{maxFlavors === 1? '1 sabor simple' : maxFlavors === 4? '1 a 4 sabores (Exclusivo 1 Kg)' : `1 a ${maxFlavors} combinaciones`}</span>
                <span>•</span>
                <span className="font-bold text-white font-mono">${product.sale_price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PORCIONES A SERVIR - Compacto */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Porciones a Servir ({filledSlotsCount}/{maxFlavors})</span>
              <span className="text-[11px] text-slate-500">~{slotGrams}g por porción • {totalAssignedGrams}g / {totalGrams}g</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-2"><div className="h-full bg-emerald-600 transition-all" style={{width: `${(filledSlotsCount/maxFlavors)*100}%`}} /></div>
            </div>
            {filledSlotsCount > 0 && (
              <button type="button" onClick={handleResetSlots} className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1"><RotateCcw className="w-3 h-3" />Limpiar</button>
            )}
          </div>
          <div className={`grid gap-2 ${maxFlavors === 1? 'grid-cols-1' : maxFlavors === 2? 'grid-cols-2' : maxFlavors === 3? 'grid-cols-3' : 'grid-cols-4'}`}>
            {slots.map((slot: any, idx: number) => {
              const isActive = activeSlotIndex === idx;
              return (
                <button key={idx} onClick={() => setActiveSlotIndex(idx)} className={`relative p-2.5 rounded-xl border-2 text-left transition-all min-h-[52px] flex flex-col justify-center ${slot? 'border-slate-900 bg-slate-900 text-white' : isActive? 'border-dashed border-slate-900 bg-white text-slate-900' : 'border-dashed border-slate-300 bg-white text-slate-400 hover:border-slate-400'}`}>
                  <div className="flex justify-between text-[10px] font-bold opacity-70"><span>Porción #{idx + 1}</span><span>{slotGrams}g</span></div>
                  <div className="text-xs font-bold truncate mt-0.5">{slot? slot.name.replace(/^Sabor:\s*/i,'') : (isActive? '👉 Elige abajo' : '+ Toca para elegir')}</div>
                  {slot && <span onClick={(e) => { e.stopPropagation(); handleClearSlot(idx); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600"><X className="w-3 h-3" /></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* CATALOGO - IZQ */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold uppercase text-slate-700 hidden lg:block">Bachas</span>
                <div className="flex gap-1 ml-1">
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setCatFilter(c.id)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${catFilter===c.id? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-900'}`}>{c.label}</button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Buscar sabor..." value={flavorSearch} onChange={(e) => setFlavorSearch(e.target.value)} className="pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full w-[130px] lg:w-[160px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 content-start bg-slate-50/50">
              {displayFlavors.map((flavor: any) => {
                const isOutOfStock = flavor.stock <= 0;
                const cleanName = flavor.name.replace(/^Sabor:\s*/i, '').replace(/Bacha de Helado de /i, '');
                const countInSlots = slots.filter((s: any) => s && s.id === flavor.id).length;
                return (
                  <div key={flavor.id} className={`bg-white rounded-xl border p-2.5 flex flex-col gap-2 transition-all ${countInSlots > 0? 'border-slate-900 ring-1 ring-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-900 hover:shadow-sm'} ${isOutOfStock? 'opacity-70' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-semibold text-slate-900 truncate leading-tight">{cleanName}</span>
                          {countInSlots > 0 && <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{countInSlots}x {countInSlots*slotGrams}g</span>}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className={`text-[11px] font-mono ${isOutOfStock? 'text-amber-600 font-bold flex items-center gap-1' : 'text-slate-500'}`}>
                            {isOutOfStock? <><AlertTriangle className="w-3 h-3" />Bacha vacía (0 kg)</> : `${flavor.stock.toFixed(1)} ${flavor.unit} disp.`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 pt-1 border-t border-slate-50">
                      <button type="button" onClick={() => handleSelectFlavor(flavor)} className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1"><Plus className="w-3 h-3" />Porción #{activeSlotIndex + 1}</button>
                      {maxFlavors > 1 && <button type="button" onClick={() => handleFillAllWithFlavor(flavor)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold">100% ({totalGrams}g)</button>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-3 py-1.5 text-[11px] text-slate-400 border-t bg-white shrink-0">Mostrando {displayFlavors.length} de 30 sabores • Scroll para ver más</div>
          </div>

          {/* DERECHA - RESUMEN + INSUMOS */}
          <div className="w-[300px] border-l border-slate-200 bg-slate-50 flex flex-col shrink-0">
            {consolidatedFlavors.length > 0 && (
              <div className="p-3 border-b bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1"><Package className="w-3.5 h-3.5" />Resumen a descontar</h4>
                  <span className="text-[11px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">{totalAssignedGrams}g / {totalGrams}g</span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {consolidatedFlavors.map((item: any) => (
                    <div key={item.flavor_id} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs">
                      <span className="font-medium truncate pr-2">{item.flavor_name}</span>
                      <span className="font-mono font-bold bg-white border px-1.5 py-0.5 rounded">{item.grams}g</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1"><Utensils className="w-3.5 h-3.5" />Insumos y Utilidades</h4>
                <div className="flex gap-1">
                  <button type="button" onClick={() => handleAddExtraSupply('Cucharitas Plásticas')} className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100">+ Cucharita</button>
                  <button type="button" onClick={() => handleAddExtraSupply('Servilletas de Papel')} className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full hover:bg-slate-200">+ Servilleta</button>
                </div>
              </div>
              <div className="space-y-1.5">
                {supplies.map((sup: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2.5 py-2">
                    <span className="text-xs font-medium truncate pr-2">{sup.supply_name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => handleUpdateSupplyQty(idx, -1)} className="w-6 h-6 rounded-full border bg-slate-50 flex items-center justify-center hover:bg-white"><Minus className="w-3 h-3" /></button>
                      <span className="w-5 text-center text-xs font-mono font-bold">{sup.quantity}</span>
                      <button type="button" onClick={() => handleUpdateSupplyQty(idx, 1)} className="w-6 h-6 rounded-full border bg-slate-50 flex items-center justify-center hover:bg-white"><Plus className="w-3 h-3" /></button>
                      <span className="text-[10px] text-slate-400 ml-1">pz</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t bg-white shrink-0">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-[11px] text-slate-500">Total a pagar:</span>
                <span className="text-lg font-black font-mono">${product.sale_price.toFixed(2)}</span>
              </div>
              <button type="button" disabled={consolidatedFlavors.length === 0} onClick={handleConfirmOrder} className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${consolidatedFlavors.length === 0? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black text-white shadow-lg active:scale-[0.98]'}`}>
                <Check className="w-4 h-4" />{consolidatedFlavors.length === 0? 'Elige al menos 1 sabor' : 'Agregar a la Venta'}
              </button>
              <button type="button" onClick={onClose} className="w-full mt-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};