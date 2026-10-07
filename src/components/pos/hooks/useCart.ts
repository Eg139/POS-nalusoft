import { useState, useMemo, useCallback } from 'react';
import { Product, CartItem, SelectedFlavorItem, SelectedSupplyItem } from '../../../types';
import { playBeep } from '../../../services/storageService';
import { isIceCreamProduct, normalizeIceCreamProduct } from '../utils/iceCreamUtils';

export const useCart = (
  soundEnabled: boolean,
  setScanMessage: (msg: { text: string; error?: boolean } | null) => void,
  setWeightedProduct: (p: Product | null) => void,
  setFlavorCustomizingProduct: (p: Product | null) => void
) => {
  const [cart, setCart] = useState<CartItem[]>([]);

const addProductToCart = useCallback((product: Product, quantityToAdd = 1, isCustomWeight = false) => {
  if (product.stock <= 0) {
    setScanMessage({ text: `¡Sin existencias! ${product.name} tiene stock 0.`, error: true });
    playBeep('error', soundEnabled);
    setTimeout(() => setScanMessage(null), 3000);
    return;
  }

  if (isIceCreamProduct(product)) {
    const normalized = normalizeIceCreamProduct(product);
    setFlavorCustomizingProduct(normalized);
    return;
  }

  if (product.unit === 'kg' && !isCustomWeight && quantityToAdd === 1) {
    setWeightedProduct(product);
    return;
  }

  setCart((prevCart) => {
    const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);

    if (existingIndex >= 0) {
      const item = prevCart[existingIndex];
      const newQty = Number((item.quantity + quantityToAdd).toFixed(3));

      if (newQty > product.stock) {
        setScanMessage({
          text: `Stock insuficiente: Solo quedan ${product.stock} ${product.unit}.`,
          error: true,
        });
        playBeep('error', soundEnabled);
        setTimeout(() => setScanMessage(null), 3000);
        return prevCart;
      }

      const discountedPrice = item.unit_price * (1 - item.discount_percent / 100);
      const subtotal = Number((newQty * discountedPrice).toFixed(2));
      const tax = Number((subtotal * product.tax_rate).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));
      const costTotal = Number((newQty * product.cost_price).toFixed(2));
      const profit = Number((subtotal - costTotal).toFixed(2));

      const updated = [...prevCart];
      updated[existingIndex] = {
        ...item,
        quantity: newQty,
        subtotal,
        tax,
        total,
        profit,
      };
      return updated;
    } else {
      if (quantityToAdd > product.stock) {
        setScanMessage({
          text: `Stock insuficiente: Solo quedan ${product.stock} ${product.unit}.`,
          error: true,
        });
        playBeep('error', soundEnabled);
        setTimeout(() => setScanMessage(null), 3000);
        return prevCart;
      }

      const subtotal = Number((quantityToAdd * product.sale_price).toFixed(2));
      const tax = Number((subtotal * product.tax_rate).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));
      const costTotal = Number((quantityToAdd * product.cost_price).toFixed(2));
      const profit = Number((subtotal - costTotal).toFixed(2));

      return [
        ...prevCart,
        {
          product,
          quantity: quantityToAdd,
          unit_price: product.sale_price,
          discount_percent: 0,
          subtotal,
          tax,
          total,
          profit,
        },
      ];
    }
  });

  playBeep('scan', soundEnabled);
  setScanMessage({ text: `Agregado: ${product.name}` });
  setTimeout(() => setScanMessage(null), 2500);
}, [soundEnabled, setCart, setScanMessage, setWeightedProduct, setFlavorCustomizingProduct]);

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id === productId) {
          const newQty = Number((item.quantity + delta).toFixed(3));
          if (newQty <= 0) return null;

          if (newQty > item.product.stock) {
            setScanMessage({ text: `Stock insuficiente (${item.product.stock})`, error: true });
            setTimeout(() => setScanMessage(null), 2500);
            return item;
          }

          const discountedPrice = item.unit_price * (1 - item.discount_percent / 100);
          const subtotal = Number((newQty * discountedPrice).toFixed(2));
          const tax = Number((subtotal * item.product.tax_rate).toFixed(2));
          const total = Number((subtotal + tax).toFixed(2));
          const costTotal = Number((newQty * item.product.cost_price).toFixed(2));
          const profit = Number((subtotal - costTotal).toFixed(2));

          return { ...item, quantity: newQty, subtotal, tax, total, profit };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const applyLineDiscount = (productId: string) => {
    const input = prompt('Ingrese el porcentaje de descuento (ej. 10 para 10%):');
    if (input === null) return;
    const discount = parseFloat(input);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      alert('Porcentaje inválido');
      return;
    }

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id === productId) {
          const discountedPrice = item.unit_price * (1 - discount / 100);
          const subtotal = Number((item.quantity * discountedPrice).toFixed(2));
          const tax = Number((subtotal * item.product.tax_rate).toFixed(2));
          const total = Number((subtotal + tax).toFixed(2));
          const costTotal = Number((item.quantity * item.product.cost_price).toFixed(2));
          const profit = Number((subtotal - costTotal).toFixed(2));

          return { ...item, discount_percent: discount, subtotal, tax, total, profit };
        }
        return item;
      });
    });
  };

  const addCustomFlavorItem = (
    prod: Product, 
    flavors: SelectedFlavorItem[], 
    supplies: SelectedSupplyItem[]
  ) => {
    const subtotal = prod.sale_price;
    const tax = Number((subtotal * prod.tax_rate).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const costTotal = prod.cost_price;
    const profit = Number((subtotal - costTotal).toFixed(2));

    const cartItem: CartItem = {
      product: prod,
      quantity: 1,
      unit_price: prod.sale_price,
      discount_percent: 0,
      subtotal,
      tax,
      total,
      profit,
      selected_flavors: flavors,
      selected_supplies: supplies,
    };

    setCart((prev) => [...prev, cartItem]);
    playBeep('scan', soundEnabled);
    setScanMessage({ text: `Agregado: ${prod.name} (${flavors.length} sabores)` });
    setTimeout(() => setScanMessage(null), 2500);
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = cart.reduce((acc, item) => acc + item.tax, 0);
    const total = Number((subtotal + tax).toFixed(2));
    const totalCost = cart.reduce((acc, item) => acc + item.quantity * item.product.cost_price, 0);
    const netProfit = Number((subtotal - totalCost).toFixed(2));
    const profitMargin = total > 0 ? Number(((netProfit / total) * 100).toFixed(2)) : 0;
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total,
      totalCost: Number(totalCost.toFixed(2)),
      netProfit,
      profitMargin,
      totalItems: Number(totalItems.toFixed(2)),
    };
  }, [cart]);

  return {
    cart,
    setCart,
    addProductToCart,
    updateQuantity,
    removeItem,
    applyLineDiscount,
    addCustomFlavorItem,
    totals,
  };
};