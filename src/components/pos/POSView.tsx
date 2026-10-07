import React from 'react';
import { Product, SupermarketSettings } from '../../types';
import { usePOS } from './hooks/usePOS';
import { 
  Barcode, Search, Plus, Minus, Trash2, ShoppingCart, 
  Percent, PauseCircle, PlayCircle, Volume2, VolumeX, CreditCard, RotateCcw,
  IceCream, Scale, Package
} from 'lucide-react';

import { PaymentModal } from './components/PaymentModal';
import { TicketModal } from './components/TicketModal';
import { WeightedItemModal } from './components/WeightedItemModal';
import { IceCreamFlavorModal } from './components/IceCreamFlavorModal';

interface POSViewProps {
  products: Product[];
  settings: SupermarketSettings;
  onRefreshData: () => void;
  onNavigateToStock?: () => void;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  settings,
  onRefreshData,
}) => {
  const {
    cart, setCart, heldCarts, setHeldCarts, barcodeInput, setBarcodeInput,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    soundEnabled, setSoundEnabled, scanMessage, isPaymentOpen, setIsPaymentOpen,
    weightedProduct, setWeightedProduct, flavorCustomizingProduct, setFlavorCustomizingProduct,
    completedSale, setCompletedSale, barcodeInputRef, categories, filteredProducts,
    addProductToCart, handleBarcodeSubmit, totals, handleConfirmIceCreamFlavors,
    handlePaymentSuccess, updateQuantity, applyLineDiscount, removeItem,
    holdCurrentCart, retrieveHeldCart, isIceCreamProduct, normalizeIceCreamProduct,
  } = usePOS(products, settings, onRefreshData);

  const renderProductBadge = (prod: Product) => {
    const isIce = isIceCreamProduct ? isIceCreamProduct(prod) : false;
    
    if (isIce) {
      const conf = normalizeIceCreamProduct ? normalizeIceCreamProduct(prod) : { max_flavors: 1, total_grams: 0 };
      return (
        <span className="text-[11px] text-pink-700 font-bold bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
          <IceCream className="w-3.5 h-3.5" />
          <span>
            {conf.max_flavors === 1
              ? `1 sabor (${conf.total_grams}g)`
              : `1 a ${conf.max_flavors} sabores (${conf.total_grams}g)`}
          </span>
        </span>
      );
    }
    
    if (prod.unit === 'kg') {
      return (
        <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
          <Scale className="w-3.5 h-3.5" />
          <span>Pesable</span>
        </span>
      );
    }
    
    return (
      <span className="text-[11px] text-slate-600 font-medium bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
        <Package className="w-3.5 h-3.5" />
        <span>Estándar</span>
      </span>
    );
  };

  return (
    /* CONTENEDOR PRINCIPAL: Fijo al alto de la pantalla disponible */
    <div className="w-full h-[calc(100vh-65px)] flex flex-col lg:flex-row overflow-hidden bg-slate-100 select-none">
      
      {/* =================================================================== */}
      {/* IZQUIERDA: Catálogo de Productos y Buscador (60% o flex-1)         */}
      {/* =================================================================== */}
      <div className="flex-1 flex flex-col h-full min-h-0 p-4 overflow-hidden">
        
        {/* Barra Superior Lector/Buscador (Fija, shrink-0) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm mb-3 shrink-0">
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Escanear código de barras o texto (Ej: 3*7501 o Enter) [F2]"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-11 pr-28 py-2.5 text-sm font-mono bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Enter ↵
              </button>
            </div>

            <div className="relative w-56 hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
              className={`p-2.5 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </form>

          {scanMessage && (
            <div
              className={`mt-2 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-between transition-all ${
                scanMessage.error
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span>{scanMessage.text}</span>
            </div>
          )}
        </div>

        {/* Pestañas de Categorías (Fija horizontal, shrink-0) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-thin shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Productos (Flexible con SCROLL INDEPENDIENTE) */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center">
              <Search className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700 text-base">No se encontraron productos</p>
              <p className="text-sm text-slate-400 mt-1">
                Prueba con otro término de búsqueda o selecciona otra categoría.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
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
                        : 'border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="truncate max-w-[85px]">{prod.category}</span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                            Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Stock {prod.stock}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            {prod.stock} {prod.unit}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-emerald-700">
                        {prod.name}
                      </h4>

                      <div className="mb-2">
                        {renderProductBadge(prod)}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                        ${prod.sale_price.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        /{prod.unit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

{/* DERECHA: Carrito y Totales - FIX NO CRECE */}
<div className="w-full lg:w-[420px] lg:max-h-[calc(100vh-65px)] h-auto lg:h-[calc(100vh-65px)] min-h-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">

  {/* Ticket Header - FIJO */}
  <div className="px-5 py-4 bg-slate-900 text-white shrink-0 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <ShoppingCart className="w-6 h-6 text-emerald-400" />
      <div>
        <h3 className="font-bold text-sm leading-tight">Ticket de Venta Actual</h3>
        <p className="text-xs text-slate-400">{settings.cashier_active} · {cart.length} items</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {cart.length > 0 && (
        <button type="button" onClick={holdCurrentCart} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"><PauseCircle className="w-4 h-4 text-amber-400" /></button>
      )}
      {heldCarts.length > 0 && (
        <div className="relative group">
          <button type="button" className="p-2 rounded-md bg-amber-500/20 text-amber-300 text-xs flex items-center gap-1 font-semibold"><PlayCircle className="w-4 h-4" />{heldCarts.length}</button>
          <div className="absolute right-0 top-full mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border py-1 hidden group-hover:block z-30">
            {heldCarts.map((hCart: any, idx: number) => (
              <button key={idx} onClick={() => retrieveHeldCart(idx)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex justify-between"><span>Venta #{idx + 1}</span><span className="font-mono font-bold text-emerald-600">${hCart.reduce((a:number,b:any)=>a+b.total,0).toFixed(2)}</span></button>
            ))}
          </div>
        </div>
      )}
      {cart.length > 0 && <button type="button" onClick={() => setCart([])} className="p-2 rounded-md bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"><RotateCcw className="w-4 h-4" /></button>}
    </div>
  </div>

  {/* Lista - LA ÚNICA QUE SCROLLEA */}
  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5 bg-slate-50">
    {cart.length === 0? (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-300 mb-4 border"><Barcode className="w-8 h-8" /></div>
        <p className="font-semibold text-slate-700">El carrito está vacío</p>
      </div>
    ) : (
      cart.map((item: any) => (
        <div key={item.product.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</h5>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="font-mono">${item.unit_price.toFixed(2)}</span><span>·</span><span className="font-mono text-slate-400">{item.product.barcode}</span>
                {item.discount_percent > 0 && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">-{item.discount_percent}%</span>}
              </div>

              {/* INFO COMPLETA PERO CONTENIDA */}
              {item.selected_flavors?.length > 0 && (
                <div className="mt-2 p-2 bg-pink-50/80 rounded-lg border border-pink-100">
                  <span className="text-[11px] font-bold text-pink-900 block mb-1">Sabores a servir:</span>
                  {/* Aquí está el fix: max-h con scroll interno, no crece la columna */}
                  <div className="flex flex-wrap gap-1.5 max-h-[88px] overflow-y-auto pr-1 content-start">
                    {item.selected_flavors.map((fl: any, idx: number) => (
                      <span key={idx} className="bg-white px-2 py-1 rounded text-[11px] text-pink-900 font-medium border border-pink-200 inline-flex items-center gap-1 shrink-0">
                        <IceCream className="w-3 h-3 text-pink-500" />{fl.flavor_name} ({fl.grams}g)
                      </span>
                    ))}
                  </div>
                  {item.selected_supplies?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-pink-200/60 flex flex-wrap gap-2 text-[11px] text-slate-600 max-h-[40px] overflow-y-auto">
                      {item.selected_supplies.map((sup: any, idx: number) => (
                        <span key={idx} className="flex items-center gap-1 shrink-0"><span className="w-1 h-1 rounded-full bg-slate-400"></span>{sup.quantity} {sup.supply_name}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="text-[15px] font-bold font-mono text-slate-900">${item.total.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => updateQuantity(item.product.id, item.product.unit === 'kg'? -0.25 : -1)} className="w-7 h-7 rounded-md bg-white border border-slate-300 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <span className="text-sm font-bold font-mono px-2 min-w-[40px] text-center">{item.quantity} <span className="text-xs font-normal text-slate-500">{item.product.unit}</span></span>
              <button type="button" onClick={() => updateQuantity(item.product.id, item.product.unit === 'kg'? 0.25 : 1)} className="w-7 h-7 rounded-md bg-white border border-slate-300 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => applyLineDiscount(item.product.id)} className="px-2.5 py-1.5 text-xs font-semibold border rounded-md flex items-center gap-1"><Percent className="w-3.5 h-3.5 text-emerald-600" />Desc</button>
              <button type="button" onClick={() => removeItem(item.product.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>

  {/* Resumen - FIJO, NUNCA CRECE */}
  <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] shrink-0">
    <div className="space-y-1.5 mb-3 text-[13px] text-slate-600">
      <div className="flex justify-between"><span>Artículos:</span><span className="font-mono font-medium">{totals.totalItems}</span></div>
      <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono">${totals.subtotal.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>IVA:</span><span className="font-mono">${totals.tax.toFixed(2)}</span></div>
    </div>
    <div className="flex items-end justify-between border-t pt-3 mb-3">
      <span className="font-bold text-slate-800">TOTAL</span><span className="text-3xl font-black font-mono tracking-tight">${totals.total.toFixed(2)}</span>
    </div>
    <button type="button" disabled={cart.length === 0} onClick={() => setIsPaymentOpen(true)} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-xl flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" />Cobrar Venta [F12]</button>
  </div>
</div>

      {/* Modales */}
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
          onConfirm={(weight: number) => {
            addProductToCart(weightedProduct, weight, true);
            setWeightedProduct(null);
          }}
          onClose={() => setWeightedProduct(null)}
        />
      )}

      {flavorCustomizingProduct && (
        <IceCreamFlavorModal
          product={flavorCustomizingProduct}
          availableProducts={products}
          onConfirm={handleConfirmIceCreamFlavors}
          onClose={() => setFlavorCustomizingProduct(null)}
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