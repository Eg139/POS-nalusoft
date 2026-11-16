import { ProductUnit } from './index';

export interface ScannedReceiptItem {
  name: string;
  quantity: number;
  cost_price: number;
  barcode: string;
}

export interface ReceiptReviewItem extends ScannedReceiptItem {
  tempId: string;
  selected: boolean;
  matchedProductId?: string;
  matchedProductName?: string;
  currentStock?: number;
  sale_price: number;
  category: string;
  unit: ProductUnit;
}

export type ReceiptScanStep = 'capture' | 'scanning' | 'review';

export interface ReceiptImportSummary {
  updatedCount: number;
  createdCount: number;
  recalculatedRecipesCount: number;
}
