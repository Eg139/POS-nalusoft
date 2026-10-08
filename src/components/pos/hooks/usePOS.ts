import { useState, useRef, useEffect, useMemo } from 'react';
import { Product, Sale, SupermarketSettings, PaymentMethod, SelectedFlavorItem, SelectedSupplyItem } from '../../../types';
import { StorageService, playBeep } from '../../../services/storageService';
import { isIceCreamProduct, normalizeIceCreamProduct } from '../utils/iceCreamUtils';
import { useCart } from './useCart';
import { useHeldCarts } from './useHeldCarts';

export const usePOS = (
  products: Product[],
  settings: SupermarketSettings,
  onRefreshData: () => void
) => {
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.beep_enabled);
  const [scanMessage, setScanMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [weightedProduct, setWeightedProduct] = useState<Product | null>(null);
  const [flavorCustomizingProduct, setFlavorCustomizingProduct] = useState<Product | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const {
    cart, setCart, addProductToCart, updateQuantity, removeItem,
    applyLineDiscount, addCustomFlavorItem, totals,
  } = useCart(soundEnabled, setScanMessage, setWeightedProduct, setFlavorCustomizingProduct);

  const { heldCarts, setHeldCarts, holdCurrentCart, retrieveHeldCart } =
    useHeldCarts(cart, setCart, setScanMessage);

  const cartRef = useRef(cart);
  cartRef.current = cart;
  const isPaymentOpenRef = useRef(isPaymentOpen);
  isPaymentOpenRef.current = isPaymentOpen;
  const completedSaleRef = useRef(completedSale);
  completedSaleRef.current = completedSale;
  const weightedProductRef = useRef(weightedProduct);
  weightedProductRef.current = weightedProduct;
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  const categories: string[] = useMemo(() => {
    let baseForCats = products;
    if (settings.store_mode === 'heladeria') {
      baseForCats = products.filter((p) => isIceCreamProduct(p));
    } else {
      // Kiosko: ocultamos sabores e insumos que no se venden solos (precio 0)
      baseForCats = products.filter((p) => {
        const isRaw = (p as any).is_raw_flavor;
        const isSupply = (p as any).is_supply;
        if (isRaw || isSupply) return false;
        if (p.sale_price === 0) return false;
        return true;
      });
    }
    const set = new Set<string>();
    baseForCats.forEach((p) => { if (p.category) set.add(p.category); });
    return ['Todos',...Array.from(set)];
  }, [products, settings.store_mode]);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [cart, isPaymentOpen, completedSale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' && cartRef.current.length > 0 &&!isPaymentOpenRef.current &&!completedSaleRef.current) {
        e.preventDefault();
        setIsPaymentOpen(true);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
      if (e.key === 'Escape' &&!isPaymentOpenRef.current &&!completedSaleRef.current &&!weightedProductRef.current) {
        if (searchQueryRef.current) setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    let base = products;

    if (settings.store_mode === 'heladeria') {
      // SOLO PRESENTACIONES EN EL POS
      base = base.filter((p) => isIceCreamProduct(p));
    } else {
      // KIOSKO: TODO menos bachas e insumos
      base = base.filter((p) => {
        if ((p as any).is_raw_flavor) return false;
        if ((p as any).is_supply) return false;
        if (p.category === 'Sabores de Helado') return false;
        if (p.category === 'Insumos y Utilidades') return false;
        if (p.sale_price === 0) return false;
        return true;
      });
    }

    return base.filter((p) => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
       !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery, settings.store_mode]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = barcodeInput.trim();
    if (!raw) return;
    setBarcodeInput('');
    let multiplier = 1;
    let codeToSearch = raw;
    if (raw.includes('*')) {
      const parts = raw.split('*');
      const parsedMult = parseFloat(parts[0]);
      if (!isNaN(parsedMult) && parsedMult > 0) {
        multiplier = parsedMult;
        codeToSearch = parts[1].trim();
      }
    }
    const matched = products.find(
      (p) => p.barcode === codeToSearch || p.barcode.toLowerCase() === codeToSearch.toLowerCase()
    );
    if (matched) {
      addProductToCart(matched, multiplier, matched.unit === 'kg' && multiplier!== 1);
    } else {
      const matchedByName = products.find((p) => p.name.toLowerCase() === codeToSearch.toLowerCase());
      if (matchedByName) {
        addProductToCart(matchedByName, multiplier);
      } else {
        setScanMessage({ text: `Código "${raw}" no encontrado en catálogo`, error: true });
        playBeep('error', soundEnabled);
        setTimeout(() => setScanMessage(null), 3000);
      }
    }
  };

  const handleConfirmIceCreamFlavors = (
    flavors: SelectedFlavorItem[],
    supplies: SelectedSupplyItem[]
  ) => {
    if (!flavorCustomizingProduct) return;
    addCustomFlavorItem(flavorCustomizingProduct, flavors, supplies);
    setFlavorCustomizingProduct(null);
  };

  const handlePaymentSuccess = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    change: number,
    notes?: string
  ) => {
    const saleItems = cart.map((item) => ({
      product_id: item.product.id,
      barcode: item.product.barcode,
      product_name: item.product.name,
      category: item.product.category,
      unit: item.product.unit,
      quantity: item.quantity,
      cost_price: item.product.cost_price,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent,
      tax_rate: item.product.tax_rate,
      subtotal: item.subtotal,
      tax: item.tax,
      total: item.total,
      profit: item.profit,
      selected_flavors: item.selected_flavors,
      selected_supplies: item.selected_supplies,
    }));

    const sale = StorageService.recordSale({
      cashier_name: settings.cashier_active || 'Cajero Principal',
      items: saleItems,
      subtotal: totals.subtotal,
      discount: 0,
      tax: totals.tax,
      total: totals.total,
      cost_total: totals.totalCost,
      net_profit: totals.netProfit,
      profit_margin: totals.profitMargin,
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      change,
      notes,
    });

    playBeep('payment', soundEnabled);
    setIsPaymentOpen(false);
    setCart([]);
    setCompletedSale(sale);
    onRefreshData();
  };

  return {
    cart, setCart, heldCarts, setHeldCarts, barcodeInput, setBarcodeInput,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    soundEnabled, setSoundEnabled, scanMessage, isPaymentOpen, setIsPaymentOpen,
    weightedProduct, setWeightedProduct, flavorCustomizingProduct, setFlavorCustomizingProduct,
    completedSale, setCompletedSale, barcodeInputRef, categories, filteredProducts,
    addProductToCart, handleBarcodeSubmit, totals, handleConfirmIceCreamFlavors,
    handlePaymentSuccess, updateQuantity, removeItem, applyLineDiscount,
    holdCurrentCart, retrieveHeldCart, isIceCreamProduct, normalizeIceCreamProduct,
  };
};