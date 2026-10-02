import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, CartItem, Sale, SupermarketSettings, ProductCategory, PaymentMethod } from '../../types';
import { StorageService, playBeep } from '../../services/storageService';
import { PaymentModal } from './PaymentModal';
import { TicketModal } from './TicketModal';
import { WeightedItemModal } from './WeightedItemModal';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Percent,
  RotateCcw,
  Volume2,
  VolumeX,
  CreditCard,
  PauseCircle,
  PlayCircle,
  AlertTriangle
} from 'lucide-react';

interface POSViewProps {
  products: Product[];
  settings: SupermarketSettings;
  onRefreshData: () => void;
  onNavigateToStock: () => void;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  settings,
  onRefreshData,
  onNavigateToStock,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<CartItem[][]>([]);
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.beep_enabled);
  const [scanMessage, setScanMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [weightedProduct, setWeightedProduct] = useState<Product | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Categories list
  const categories: string[] = [
    'Todos',
    'Abarrotes',
    'Lácteos y Huevos',
    'Frutas y Verduras',
    'Carnicería y Embutidos',
    'Panadería y Tortillería',
    'Bebidas y Licores',
    'Snacks y Dulces',
    'Limpieza y Hogar',
    'Cuidado Personal',
  ];

  // Autofocus scanner input on mount & after actions
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [cart, isPaymentOpen, completedSale]);

  // Global POS Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 to Pay
      if (e.key === 'F12' && cart.length > 0 && !isPaymentOpen && !completedSale) {
        e.preventDefault();
        setIsPaymentOpen(true);
      }
      // F2 to focus scanner input
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
      // Esc to clear search or cart
      if (e.key === 'Escape' && !isPaymentOpen && !completedSale && !weightedProduct) {
        if (searchQuery) setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isPaymentOpen, completedSale, weightedProduct, searchQuery]);

  // Filtered products for visual quick catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add Product to Cart helper
  const addProductToCart = (product: Product, quantityToAdd = 1, isCustomWeight = false) => {
    if (product.stock <= 0) {
      setScanMessage({ text: `¡Sin existencias! ${product.name} tiene stock 0.`, error: true });
      playBeep('error', soundEnabled);
      setTimeout(() => setScanMessage(null), 3000);
      return;
    }

    // If item is sold by kg and not already weighted, open weight scale modal
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
  };

  // Handle Barcode Scanner Input Submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = barcodeInput.trim();
    if (!raw) return;

    // Check multiplier syntax: e.g. "3*75010001" or "0.5*200000000001"
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
      addProductToCart(matched, multiplier, matched.unit === 'kg' && multiplier !== 1);
      setBarcodeInput('');
    } else {
      // Try finding by name exact match
      const matchedByName = products.find((p) => p.name.toLowerCase() === raw.toLowerCase());
      if (matchedByName) {
        addProductToCart(matchedByName, multiplier);
        setBarcodeInput('');
      } else {
        setScanMessage({ text: `Código "${raw}" no encontrado en catálogo`, error: true });
        playBeep('error', soundEnabled);
        setTimeout(() => setScanMessage(null), 3000);
      }
    }
  };

  // Update item quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id !== productId) return item;
          const newQty = Number((item.quantity + delta).toFixed(3));
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            setScanMessage({
              text: `Stock máximo alcanzado (${item.product.stock} ${item.product.unit})`,
              error: true,
            });
            return item;
          }

          const discountedPrice = item.unit_price * (1 - item.discount_percent / 100);
          const subtotal = Number((newQty * discountedPrice).toFixed(2));
          const tax = Number((subtotal * item.product.tax_rate).toFixed(2));
          const total = Number((subtotal + tax).toFixed(2));
          const costTotal = Number((newQty * item.product.cost_price).toFixed(2));
          const profit = Number((subtotal - costTotal).toFixed(2));

          return { ...item, quantity: newQty, subtotal, tax, total, profit };
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Apply discount to line item
  const applyLineDiscount = (productId: string) => {
    const promptVal = window.prompt('Ingresa el % de descuento para este producto (0 a 100):', '10');
    if (promptVal === null) return;
    const discount = Math.min(100, Math.max(0, parseFloat(promptVal) || 0));

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id !== productId) return item;
        const discountedPrice = item.unit_price * (1 - discount / 100);
        const subtotal = Number((item.quantity * discountedPrice).toFixed(2));
        const tax = Number((subtotal * item.product.tax_rate).toFixed(2));
        const total = Number((subtotal + tax).toFixed(2));
        const costTotal = Number((item.quantity * item.product.cost_price).toFixed(2));
        const profit = Number((subtotal - costTotal).toFixed(2));

        return { ...item, discount_percent: discount, subtotal, tax, total, profit };
      });
    });
  };

  // Remove single line
  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Hold current cart
  const holdCurrentCart = () => {
    if (cart.length === 0) return;
    setHeldCarts((prev) => [...prev, cart]);
    setCart([]);
    setScanMessage({ text: 'Venta puesta en espera' });
    setTimeout(() => setScanMessage(null), 2000);
  };

  // Retrieve held cart
  const retrieveHeldCart = (index: number) => {
    const target = heldCarts[index];
    if (!target) return;
    setCart(target);
    setHeldCarts((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Cart financial totals
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

  // Complete Payment Handler
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden bg-slate-100">
      {/* LEFT COLUMN: Fast Catalog & Visual Barcode Search (60%) */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Top Scanner Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs mb-3">
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Escanear código de barras o ingresar texto (Ej: 3*75010001 o Enter) [F2]"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-11 pr-28 py-2.5 text-sm font-mono bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Enter ↵
              </button>
            </div>

            {/* Quick Live Text Search */}
            <div className="relative w-56 hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Sonido de escáner activado' : 'Sonido desactivado'}
              className={`p-2.5 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </form>

          {/* Alert / Feedback message */}
          {scanMessage && (
            <div
              className={`mt-2 py-1 px-3 rounded-md text-xs font-medium flex items-center justify-between transition-all ${
                scanMessage.error
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span>{scanMessage.text}</span>
            </div>
          )}
        </div>

        {/* Category Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center">
              <Search className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No se encontraron productos</p>
              <p className="text-xs text-slate-400 mt-1">
                Prueba con otro término de búsqueda o selecciona otra categoría.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 pb-4">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.min_stock_alert;

                return (
                  <button
                    key={prod.id}
                    disabled={isOutOfStock}
                    onClick={() => addProductToCart(prod)}
                    className={`text-left p-3 rounded-xl border bg-white flex flex-col justify-between transition-all duration-150 relative group ${
                      isOutOfStock
                        ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-98'
                    }`}
                  >
                    <div>
                      {/* Category & Badge */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="truncate max-w-[85px]">{prod.category}</span>
                        {isOutOfStock ? (
                          <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1 py-0.5 rounded">
                            Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                            Stock {prod.stock}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500">
                            {prod.stock} {prod.unit}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-emerald-700">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        ${prod.sale_price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        /{prod.unit}
                      </span>
                    </div>

                    {prod.unit === 'kg' && (
                      <span className="text-[9px] text-emerald-600 font-medium mt-0.5">
                        ⚖️ Pesable
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Cash Register Ticket / Cart (40%) */}
      <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
        {/* Ticket Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Ticket de Venta Actual</h3>
              <p className="text-[10px] text-slate-400">{settings.cashier_active}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hold Cart Button */}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={holdCurrentCart}
                title="Poner venta en espera"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
              >
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Espera</span>
              </button>
            )}

            {/* Held Carts Badge */}
            {heldCarts.length > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  className="p-1.5 rounded-md bg-amber-500/20 text-amber-300 text-xs flex items-center gap-1 font-semibold"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{heldCarts.length} en espera</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 hidden group-hover:block z-30">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b">
                    Recuperar Venta:
                  </div>
                  {heldCarts.map((hCart, idx) => (
                    <button
                      key={idx}
                      onClick={() => retrieveHeldCart(idx)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex justify-between items-center"
                    >
                      <span>Venta #{idx + 1} ({hCart.length} prods)</span>
                      <span className="font-mono font-bold text-emerald-600">
                        ${hCart.reduce((a, b) => a + b.total, 0).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                title="Limpiar ticket"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                <Barcode className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">El carrito está vacío</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Usa el lector de código de barras, pulsa sobre un producto o presiona F2 para comenzar la venta.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-slate-900 truncate">
                      {item.product.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono tabular-nums">${item.unit_price.toFixed(2)}</span>
                      <span>·</span>
                      <span className="text-slate-400 font-mono">{item.product.barcode}</span>
                      {item.discount_percent > 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">
                          -{item.discount_percent}%
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-sm font-bold font-mono tabular-nums text-slate-900 whitespace-nowrap">
                    ${item.total.toFixed(2)}
                  </span>
                </div>

                {/* Quantity Controls & Line Discount */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.product.unit === 'kg' ? -0.25 : -1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold font-mono tabular-nums px-1.5 min-w-[36px] text-center text-slate-800">
                      {item.quantity} {item.product.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.product.unit === 'kg' ? 0.25 : 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => applyLineDiscount(item.product.id)}
                      title="Aplicar descuento a esta partida"
                      className="px-2 py-1 text-[10px] font-semibold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-300 rounded flex items-center gap-1 transition-colors"
                    >
                      <Percent className="w-3 h-3 text-emerald-600" />
                      <span>Desc</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      title="Eliminar partida"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financial Summary & Large Total */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Artículos:</span>
            <span className="font-mono tabular-nums">{totals.totalItems}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono tabular-nums">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>IVA Trasladado:</span>
            <span className="font-mono tabular-nums">${totals.tax.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-300 flex items-baseline justify-between">
            <span className="text-base font-bold text-slate-800">TOTAL:</span>
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              ${totals.total.toFixed(2)}
            </span>
          </div>

          {/* Action Checkout Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <CreditCard className="w-5 h-5" />
            <span>Cobrar Venta [F12]</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {isPaymentOpen && (
        <PaymentModal
          total={totals.total}
          subtotal={totals.subtotal}
          tax={totals.tax}
          onConfirm={handlePaymentSuccess}
          onClose={() => setIsPaymentOpen(false)}
        />
      )}

      {weightedProduct && (
        <WeightedItemModal
          product={weightedProduct}
          onConfirm={(weight) => {
            addProductToCart(weightedProduct, weight, true);
            setWeightedProduct(null);
          }}
          onClose={() => setWeightedProduct(null)}
        />
      )}

      {completedSale && (
        <TicketModal
          sale={completedSale}
          settings={settings}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};
