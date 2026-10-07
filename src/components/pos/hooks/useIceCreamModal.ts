import { useState, useMemo } from 'react';
import { Product, SelectedFlavorItem, SelectedSupplyItem } from '../../../types';
import { ICE_CREAM_PRODUCTS } from '../../../data/iceCreamData';

export const useIceCreamModal = (
  product: Product,
  availableProducts: Product[],
  onConfirm: (flavors: SelectedFlavorItem[], supplies: SelectedSupplyItem[]) => void
) => {
  const maxFlavors = product.max_flavors || 2;
  const totalGrams = product.total_grams || 160;
  const slotGrams = Math.round(totalGrams / maxFlavors);

  const [flavorSearch, setFlavorSearch] = useState('');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  
  const [slots, setSlots] = useState<Array<{ id: string; name: string } | null>>(() => 
    Array(maxFlavors).fill(null)
  );

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

  const filteredFlavors = useMemo(() => {
    if (!flavorSearch.trim()) return rawFlavors;
    const q = flavorSearch.toLowerCase().trim();
    return rawFlavors.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.batch_number && f.batch_number.toLowerCase().includes(q))
    );
  }, [rawFlavors, flavorSearch]);

  const handleFillAllWithFlavor = (flavor: Product) => {
    const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');
    setSlots(Array(maxFlavors).fill({ id: flavor.id, name: cleanName }));
    setActiveSlotIndex(maxFlavors - 1);
  };

  const handleSelectFlavor = (flavor: Product) => {
    const cleanName = flavor.name.replace(/^Sabor:\s*/i, '');

    if (maxFlavors === 1) {
      setSlots([{ id: flavor.id, name: cleanName }]);
      return;
    }

    const updated = [...slots];
    updated[activeSlotIndex] = { id: flavor.id, name: cleanName };
    setSlots(updated);

    const nextUnfilledIndex = updated.findIndex((s, idx) => idx > activeSlotIndex && s === null);
    if (nextUnfilledIndex !== -1) {
      setActiveSlotIndex(nextUnfilledIndex);
    } else {
      const anyUnfilledIndex = updated.findIndex((s) => s === null);
      if (anyUnfilledIndex !== -1) {
        setActiveSlotIndex(anyUnfilledIndex);
      } else {
        setActiveSlotIndex((activeSlotIndex + 1) % maxFlavors);
      }
    }
  };

  const handleClearSlot = (index: number) => {
    const updated = [...slots];
    updated[index] = null;
    setSlots(updated);
    setActiveSlotIndex(index);
  };

  const handleResetSlots = () => {
    setSlots(Array(maxFlavors).fill(null));
    setActiveSlotIndex(0);
  };

  const consolidatedFlavors: SelectedFlavorItem[] = useMemo(() => {
    const filledSlots = slots.filter(Boolean) as Array<{ id: string; name: string }>;
    if (filledSlots.length === 0) return [];

    const uniqueFilled = Array.from(new Set(filledSlots.map((s) => s.id)));
    if (uniqueFilled.length === 1 && filledSlots.length < maxFlavors) {
      const single = filledSlots[0];
      return [{ flavor_id: single.id, flavor_name: single.name, grams: totalGrams }];
    }

    const gramsPerFilledSlot = Math.floor(totalGrams / filledSlots.length);
    const remainder = totalGrams % filledSlots.length;
    const map = new Map<string, { flavor_id: string; flavor_name: string; grams: number }>();

    filledSlots.forEach((slot, idx) => {
      const slotWeight = gramsPerFilledSlot + (idx === 0 ? remainder : 0);
      const existing = map.get(slot.id);
      if (existing) {
        existing.grams += slotWeight;
      } else {
        map.set(slot.id, { flavor_id: slot.id, flavor_name: slot.name, grams: slotWeight });
      }
    });

    return Array.from(map.values());
  }, [slots, maxFlavors, totalGrams]);

  const totalAssignedGrams = useMemo(() => {
    return consolidatedFlavors.reduce((sum, f) => sum + f.grams, 0);
  }, [consolidatedFlavors]);

  const handleUpdateSupplyQty = (index: number, delta: number) => {
    setSupplies((prev) =>
      prev.map((s, i) => (i !== index ? s : { ...s, quantity: Math.max(0, s.quantity + delta) }))
    );
  };

  const handleAddExtraSupply = (name: string) => {
    const existingIndex = supplies.findIndex((s) => s.supply_name.toLowerCase().includes(name.toLowerCase()));
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

  return {
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
    filledSlotsCount: slots.filter(Boolean).length,
    consolidatedFlavors,
    totalAssignedGrams,
    handleSelectFlavor,
    handleFillAllWithFlavor,
    handleClearSlot,
    handleResetSlots,
    handleUpdateSupplyQty,
    handleAddExtraSupply,
    handleConfirmOrder,
  };
};