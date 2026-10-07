import { useState } from 'react';
import { CartItem } from '../../../types';

export const useHeldCarts = (
  cart: CartItem[],
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setScanMessage: (msg: { text: string; error?: boolean } | null) => void
) => {
  const [heldCarts, setHeldCarts] = useState<CartItem[][]>([]);

  const holdCurrentCart = () => {
    if (cart.length === 0) return;
    setHeldCarts((prev) => [...prev, cart]);
    setCart([]);
    setScanMessage({ text: 'Venta puesta en espera' });
    setTimeout(() => setScanMessage(null), 2500);
  };

  const retrieveHeldCart = (index: number) => {
    const targetCart = heldCarts[index];
    if (!targetCart) return;

    setCart(targetCart);
    setHeldCarts((prev) => prev.filter((_, i) => i !== index));
    setScanMessage({ text: 'Venta recuperada con éxito' });
    setTimeout(() => setScanMessage(null), 2500);
  };

  return {
    heldCarts,
    setHeldCarts,
    holdCurrentCart,
    retrieveHeldCart,
  };
};