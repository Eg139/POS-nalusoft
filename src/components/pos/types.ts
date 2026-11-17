import React from 'react';
import { CartItem, Product } from '../../types';

export interface POSTotals {
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface POSLayoutProps {
  cashierName: string;
  barcodeInput: string;
  onBarcodeInputChange: (val: string) => void;
  onBarcodeSubmit: (e: React.FormEvent) => void;
  barcodeInputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  scanMessage: { text: string; error?: boolean } | null;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  filteredProducts: Product[];
  onAddProduct: (prod: Product) => void;
  cart: CartItem[];
  heldCarts: CartItem[][];
  totals: POSTotals;
  onHoldCart: () => void;
  onRetrieveHeldCart: (idx: number) => void;
  onClearCart: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onApplyDiscount: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onOpenPayment: () => void;
}
