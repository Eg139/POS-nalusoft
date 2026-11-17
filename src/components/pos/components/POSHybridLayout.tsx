import React from 'react';
import { POSLayoutProps } from '../types';
import { POSProductGrid } from './POSProductGrid';
import { POSCartPanel } from './POSCartPanel';

export const POSHybridLayout: React.FC<POSLayoutProps> = (props) => {
  return (
    <div className="hidden md:flex flex-1 flex-row h-[calc(100vh-65px)] min-h-0 overflow-hidden bg-slate-100">
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
      />

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
      />
    </div>
  );
};
