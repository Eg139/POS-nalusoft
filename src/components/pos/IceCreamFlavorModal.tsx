import React, { useState, useMemo } from 'react';
import { X, Check, Plus, Minus, Sparkles, Utensils, RotateCcw, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { Product, SelectedFlavorItem, SelectedSupplyItem } from '../../types';
import { ICE_CREAM_PRODUCTS } from '../../data/iceCreamData';

interface IceCreamFlavorModalProps {
  product: Product;
  availableProducts: Product[];
  onConfirm: (flavors: SelectedFlavorItem[], supplies: SelectedSupplyItem[]) => void;
  onClose: () => void;
}

export const IceCreamFlavorModal: React.FC<IceCreamFlavorModalProps> = ({
  product,
  availableProducts,
  onConfirm,
  onClose,
}) => {
  // Cono Simple: 1, Cono Doble: 2, Vasito Chico: 2, Vasito Mediano: 3, Pote 1/4: 3, Pote 1/2: 3, Pote 1kg: 4
  const maxFlavors = product.max_flavors || 2;
  const totalGrams = product.total_grams || 160;

  // Grams per slot (e.g. 1000g / 4 = 250g each; 160g / 2 = 80g each)
  const slotGrams = Math.round(totalGrams / maxFlavors);

  // Filter raw bulk flavors available in stock (or fallback to default catalog)
  const rawFlavors = useMemo(() => {
    const list = availableProducts.filter(
      (p) =>
        p.is_raw_flavor ||
        p.category.toLowerCase().includes('sabor') ||
        p.category.toLowerCase().includes('granel') ||
        p.name.toLowerCase().startsWith('sabor') ||
        (p.category.toLowerCase().includes('helad') && p.unit === 'kg' && !p.is_icecream_presentation && !p.is_supply)
    );

    if (list.length === 0) {
      return ICE_CREAM_PRODUCTS.filter((p) => p.is_raw_flavor);
    }
    return list;
  }, [availableProducts]);

  // Search filter for flavors in modal
  const [flavorSearch, setFlavorSearch] = useState('');

  const filteredFlavors = useMemo(() => {
    if (!flavorSearch.trim()) return rawFlavors;
    const q = flavorSearch.toLowerCase().trim();
    return rawFlavors.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.batch_number && f.batch_number.toLowerCase().includes(q))
    );
  }, [rawFlavors, flavorSearch]);

  // Slots array: length equals maxFlavors.
  // Each element is either null or { id: string; name: string }
  const [slots, setSlots] = useState<Array<{ id: string; name: string } | null>>(() => {
    return Array(maxFlavors).fill(null);
  });

  // Active slot index to fill next
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

  // Supplies adjustment
  const [supplies, setSupplies] = useState<SelectedSupplyItem[]>(() => {
    if (product.default_supplies && product.default_supplies.length > 0) {
      return product.default_supplies.map((s) => ({
        supply_name: s.supply_name,
        quantity: s.quantity,
      }));
    }
    return [
      { supply_name: 'Cucharitas Plásticas', quantity: 1 },
      { supply_name: 'Servilletas de Papel', quantity: 1 },
    ];
  });

  // Fill ALL slots with a single flavor ("Todo de un solo sabor")
  const handleFillAllWithFlavor = (flavor: Product) => {
    const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');
    const newSlots = Array(maxFlavors).fill({ id: flavor.id, name: cleanName });
    setSlots(newSlots);
    setActiveSlotIndex(maxFlavors - 1);
  };

  // Click on a flavor card
  const handleSelectFlavor = (flavor: Product) => {
    const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');

    // If only 1 slot exists (like Cono Simple), just set it
    if (maxFlavors === 1) {
      setSlots([{ id: flavor.id, name: cleanName }]);
      return;
    }

    // Set the flavor in the activeSlotIndex
    const updated = [...slots];
    updated[activeSlotIndex] = { id: flavor.id, name: cleanName };
    setSlots(updated);

    // Advance to the next unfilled slot, or loop to the next
    const nextUnfilledIndex = updated.findIndex((s, idx) => idx > activeSlotIndex && s === null);
    if (nextUnfilledIndex !== -1) {
      setActiveSlotIndex(nextUnfilledIndex);
    } else {
      const anyUnfilledIndex = updated.findIndex((s) => s === null);
      if (anyUnfilledIndex !== -1) {
        setActiveSlotIndex(anyUnfilledIndex);
      } else {
        // All filled, cycle to next
        setActiveSlotIndex((activeSlotIndex + 1) % maxFlavors);
      }
    }
  };

  // Clear a specific slot
  const handleClearSlot = (index: number) => {
    const updated = [...slots];
    updated[index] = null;
    setSlots(updated);
    setActiveSlotIndex(index);
  };

  // Reset all slots
  const handleResetSlots = () => {
    setSlots(Array(maxFlavors).fill(null));
    setActiveSlotIndex(0);
  };

  // Consolidate the slots into calculated flavors with grouped grams
  const consolidatedFlavors: SelectedFlavorItem[] = useMemo(() => {
    const filledSlots = slots.filter(Boolean) as Array<{ id: string; name: string }>;

    // If completely empty, return empty
    if (filledSlots.length === 0) return [];

    // Case A: If user only filled 1 slot (or clicked 1 flavor) and others are null,
    // they want the whole container (100% of grams) of that single flavor!
    const uniqueFilled = Array.from(new Set(filledSlots.map((s) => s.id)));
    if (uniqueFilled.length === 1 && filledSlots.length < maxFlavors) {
      const single = filledSlots[0];
      return [
        {
          flavor_id: single.id,
          flavor_name: single.name,
          grams: totalGrams, // Entire container weight (e.g. 1000g, 500g, 250g, etc.)
        },
      ];
    }

    // Case B: Slots are filled (either with same flavor repeating or different combinations)
    // Calculate grams per filled slot
    const gramsPerFilledSlot = Math.floor(totalGrams / filledSlots.length);
    const remainder = totalGrams % filledSlots.length;

    // Group by flavor ID so identical flavors get aggregated into one clean line
    const map = new Map<string, { flavor_id: string; flavor_name: string; grams: number }>();

    filledSlots.forEach((slot, idx) => {
      const slotWeight = gramsPerFilledSlot + (idx === 0 ? remainder : 0);
      const existing = map.get(slot.id);
      if (existing) {
        existing.grams += slotWeight;
      } else {
        map.set(slot.id, {
          flavor_id: slot.id,
          flavor_name: slot.name,
          grams: slotWeight,
        });
      }
    });

    return Array.from(map.values());
  }, [slots, maxFlavors, totalGrams]);

  // Total grams currently assigned
  const totalAssignedGrams = useMemo(() => {
    return consolidatedFlavors.reduce((sum, f) => sum + f.grams, 0);
  }, [consolidatedFlavors]);

  // Supplies adjustment
  const handleUpdateSupplyQty = (index: number, delta: number) => {
    setSupplies((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const newQty = Math.max(0, s.quantity + delta);
        return { ...s, quantity: newQty };
      })
    );
  };

  const handleAddExtraSupply = (name: string) => {
    const existingIndex = supplies.findIndex((s) =>
      s.supply_name.toLowerCase().includes(name.toLowerCase())
    );
    if (existingIndex >= 0) {
      handleUpdateSupplyQty(existingIndex, 1);
    } else {
      setSupplies((prev) => [...prev, { supply_name: name, quantity: 1 }]);
    }
  };

  const handleConfirmOrder = () => {
    if (consolidatedFlavors.length === 0) return;
    onConfirm(consolidatedFlavors, supplies);
  };

  const filledSlotsCount = slots.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🍨</span>
              <h3 className="font-extrabold text-base tracking-tight">{product.name}</h3>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-pink-100 font-medium">
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold text-white">
                {totalGrams}g totales
              </span>
              <span>•</span>
              <span>
                {maxFlavors === 1
                  ? '1 sabor simple (80g)'
                  : maxFlavors === 4
                  ? '1 a 4 combinaciones (Exclusivo 1 Kg)'
                  : `1 a ${maxFlavors} combinaciones`}
              </span>
              <span>•</span>
              <span className="font-bold text-white">${product.sale_price.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* SLOTS DISPLAY: Individual Porciones / Bolas */}
          <div className="p-4 bg-pink-50/70 border border-pink-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-pink-950 uppercase tracking-wider">
                  Porciones a Servir ({filledSlotsCount}/{maxFlavors})
                </span>
                <span className="text-[11px] text-pink-700 font-medium">
                  (~{slotGrams}g por porción)
                </span>
              </div>
              {filledSlotsCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetSlots}
                  className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            {/* Interactive Slot Buttons */}
            <div
              className={`grid gap-2 ${
                maxFlavors === 1
                  ? 'grid-cols-1'
                  : maxFlavors === 2
                  ? 'grid-cols-2'
                  : maxFlavors === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {slots.map((slot, idx) => {
                const isActive = activeSlotIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveSlotIndex(idx)}
                    className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between min-h-[74px] ${
                      slot
                        ? 'border-pink-500 bg-white shadow-xs'
                        : isActive
                        ? 'border-dashed border-pink-500 bg-pink-100/70 ring-2 ring-pink-400/40'
                        : 'border-dashed border-slate-300 bg-white/80 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                      <span>Porción #{idx + 1}</span>
                      <span className="font-mono text-pink-700 font-bold">{slotGrams}g</span>
                    </div>

                    {slot ? (
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {slot.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearSlot(idx);
                          }}
                          className="mt-1 text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                        >
                          ✕ Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <span className="text-xs font-medium">
                          {isActive ? '👉 Elige sabor abajo' : '+ Toca para elegir'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Helper tips */}
            <p className="text-[11px] text-slate-600 italic">
              💡 <strong>Opciones de Venta:</strong> Puedes tocar cualquier sabor para asignarlo a la porción activa,
              o pulsar <em>"🍨 Servir 100% de este sabor"</em> si el cliente desea todo de un solo sabor.
            </p>
          </div>

          {/* FLAVORS LIST */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Catálogo de Sabores en Bachas</span>
              </label>

              <input
                type="text"
                placeholder="Buscar sabor..."
                value={flavorSearch}
                onChange={(e) => setFlavorSearch(e.target.value)}
                className="px-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg max-w-[200px] focus:outline-hidden focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredFlavors.map((flavor) => {
                const isOutOfStock = flavor.stock <= 0;
                const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');
                const countInSlots = slots.filter((s) => s && s.id === flavor.id).length;

                return (
                  <div
                    key={flavor.id}
                    onClick={() => handleSelectFlavor(flavor)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      countInSlots > 0
                        ? 'border-pink-600 bg-pink-50/80 shadow-xs ring-1 ring-pink-500/20'
                        : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50/90 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🍧</span>
                          <h4 className="font-bold text-xs text-slate-900 truncate">{cleanName}</h4>
                        </div>

                        {/* Batch and Manufacturing Date */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                          {flavor.manufacturing_date && (
                            <span className="flex items-center gap-0.5 text-blue-700 font-medium">
                              <Calendar className="w-3 h-3 text-blue-500" />
                              <span>Elab: {flavor.manufacturing_date}</span>
                            </span>
                          )}
                          {flavor.batch_number && (
                            <span className="flex items-center gap-0.5 text-slate-500 font-mono">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span>Lote: {flavor.batch_number}</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-[11px] font-mono">
                          {isOutOfStock ? (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Bacha vacía (0 kg) - se registrará ajuste</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">
                              Stock: {flavor.stock.toFixed(1)} {flavor.unit} disp.
                            </span>
                          )}
                        </div>
                      </div>

                      {countInSlots > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-600 text-white shrink-0">
                          {countInSlots}x ({countInSlots * slotGrams}g)
                        </span>
                      )}
                    </div>

                    {/* Quick Action buttons on flavor */}
                    <div
                      className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectFlavor(flavor)}
                        className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-pink-100 text-[11px] font-semibold text-slate-700 hover:text-pink-900 transition-colors text-center"
                      >
                        + Porción #{activeSlotIndex + 1}
                      </button>

                      {maxFlavors > 1 && (
                        <button
                          type="button"
                          onClick={() => handleFillAllWithFlavor(flavor)}
                          title="Llenar todas las porciones con este sabor"
                          className="py-1 px-2.5 rounded-lg bg-pink-100 hover:bg-pink-200 text-[11px] font-bold text-pink-800 transition-colors whitespace-nowrap"
                        >
                          🍨 Servir 100% ({totalGrams}g)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRAMS BREAKDOWN ACCUMULATED PREVIEW */}
          {consolidatedFlavors.length > 0 && (
            <div className="p-3.5 bg-pink-50 border border-pink-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-pink-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚖️</span>
                  <span>Resumen de Helado a Descontar de Bachas:</span>
                </h4>
                <span className="text-xs font-black font-mono text-pink-700">
                  {totalAssignedGrams}g / {totalGrams}g
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {consolidatedFlavors.map((item) => (
                  <div
                    key={item.flavor_id}
                    className="p-2.5 bg-white rounded-lg border border-pink-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 truncate pr-2">
                      {item.flavor_name}
                    </span>
                    <span className="font-mono font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {item.grams} gramos
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INSUMOS & UTILIDADES */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Insumos y Utilidades a Descontar:</span>
              </h4>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleAddExtraSupply('Cucharitas Plásticas')}
                  className="px-2 py-0.5 font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                >
                  + Cucharita
                </button>
                <button
                  type="button"
                  onClick={() => handleAddExtraSupply('Servilletas de Papel')}
                  className="px-2 py-0.5 font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                >
                  + Servilleta
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {supplies.map((sup, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-medium text-slate-800">{sup.supply_name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <button
                      type="button"
                      onClick={() => handleUpdateSupplyQty(idx, -1)}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-900">{sup.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateSupplyQty(idx, 1)}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-400">pz</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] text-slate-500 block">Total a pagar:</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              ${product.sale_price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={consolidatedFlavors.length === 0}
              onClick={handleConfirmOrder}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
                consolidatedFlavors.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700 active:scale-98 shadow-pink-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {consolidatedFlavors.length === 0
                  ? 'Elige al menos 1 sabor'
                  : consolidatedFlavors.length === 1
                  ? `Agregar a la Venta (100% ${consolidatedFlavors[0].flavor_name})`
                  : `Agregar a la Venta (${consolidatedFlavors.length} sabores - $${product.sale_price.toFixed(2)})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
