import React from 'react';
import { Product, SupermarketSettings } from '../../types';
import { usePOS } from './hooks/usePOS';
import { POSLayoutProps } from './types';
import { POSMobileLayout } from './components/POSMobileLayout';
import { POSHybridLayout } from './components/POSHybridLayout';
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
    cart, setCart, heldCarts, barcodeInput, setBarcodeInput,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    soundEnabled, setSoundEnabled, scanMessage, isPaymentOpen, setIsPaymentOpen,
    weightedProduct, setWeightedProduct, flavorCustomizingProduct, setFlavorCustomizingProduct,
    completedSale, setCompletedSale, barcodeInputRef, categories, filteredProducts,
    addProductToCart, handleBarcodeSubmit, totals, handleConfirmIceCreamFlavors,
    handlePaymentSuccess, updateQuantity, applyLineDiscount, removeItem,
    holdCurrentCart, retrieveHeldCart,
  } = usePOS(products, settings, onRefreshData);

  const layoutProps: POSLayoutProps = {
    cashierName: settings.cashier_active,
    barcodeInput,
    onBarcodeInputChange: setBarcodeInput,
    onBarcodeSubmit: handleBarcodeSubmit,
    barcodeInputRef,
    searchQuery,
    onSearchChange: setSearchQuery,
    soundEnabled,
    onToggleSound: () => setSoundEnabled(!soundEnabled),
    scanMessage,
    categories,
    selectedCategory,
    onSelectCategory: setSelectedCategory,
    filteredProducts,
    onAddProduct: (prod) => addProductToCart(prod),
    cart,
    heldCarts,
    totals,
    onHoldCart: holdCurrentCart,
    onRetrieveHeldCart: retrieveHeldCart,
    onClearCart: () => setCart([]),
    onUpdateQuantity: updateQuantity,
    onApplyDiscount: applyLineDiscount,
    onRemoveItem: removeItem,
    onOpenPayment: () => setIsPaymentOpen(true),
  };

  return (
    <div className="w-full h-[calc(100vh-65px)] flex flex-col overflow-hidden bg-slate-100 select-none">
      <POSMobileLayout {...layoutProps} />
      <POSHybridLayout {...layoutProps} />

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