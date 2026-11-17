import React, { useState } from 'react';
import { LayoutGrid, ShoppingCart, CreditCard } from 'lucide-react';
import { POSLayoutProps } from '../types';
import { POSProductGrid } from './POSProductGrid';
import { POSCartPanel } from './POSCartPanel';

type MobileTab = 'catalog' | 'cart';

export const POSMobileLayout: React.FC<POSLayoutProps> = (props) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('catalog');

  return (
    <div className="md:hidden flex-1 flex flex-col h-[calc(100vh-65px)] min-h-0 bg-slate-100 overflow-hidden">
      <div className="px-3 pt-2.5 pb-1.5 bg-white border-b border-slate-200 shrink-0">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`min-h-[44px] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Catálogo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`min-h-[44px] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'cart'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Carrito ({props.totals.totalItems})</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {activeTab === 'catalog' ? (
          <POSProductGrid
            barcodeInput={props.barcodeInput}
            onBarcodeInputChange={props.onBarcodeInputChange}
            onBarcodeSubmit={props.onBarcodeSubmit}
            barcodeInputRef={props.barcodeInputRef}
            searchQuery={props.searchQuery}
            onSearchChange={props.onSearchChange}
            soundEnabled={props.soundEnabled}
            onToggleSound={props.onToggleSound}
            scanMessage={props.scanMessage}
            categories={props.categories}
            selectedCategory={props.selectedCategory}
            onSelectCategory={props.onSelectCategory}
            filteredProducts={props.filteredProducts}
            onAddProduct={props.onAddProduct}
            compact
          />
        ) : (
          <POSCartPanel
            cashierName={props.cashierName}
            cart={props.cart}
            heldCarts={props.heldCarts}
            totals={props.totals}
            onHoldCart={props.onHoldCart}
            onRetrieveHeldCart={props.onRetrieveHeldCart}
            onClearCart={props.onClearCart}
            onUpdateQuantity={props.onUpdateQuantity}
            onApplyDiscount={props.onApplyDiscount}
            onRemoveItem={props.onRemoveItem}
            onOpenPayment={props.onOpenPayment}
            compact
          />
        )}
      </div>

      <div className="px-3 py-2 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 shrink-0 z-20">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'catalog' ? 'cart' : 'catalog')}
          className="min-h-[44px] px-2 text-left flex flex-col justify-center min-w-0"
        >
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
            {props.totals.totalItems} {props.totals.totalItems === 1 ? 'ítem' : 'ítems'}
          </span>
          <span className="text-xl font-black font-mono tabular-nums text-slate-900 leading-none">
            ${props.totals.total.toFixed(2)}
          </span>
        </button>

        <button
          type="button"
          disabled={props.cart.length === 0}
          onClick={props.onOpenPayment}
          className="min-h-[44px] px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 whitespace-nowrap"
        >
          <CreditCard className="w-4 h-4" />
          <span>Cobrar</span>
        </button>
      </div>
    </div>
  );
};
