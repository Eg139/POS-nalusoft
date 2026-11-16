import React from 'react';
import { IceCream, Scale, Package } from 'lucide-react';
import { Product } from '../../../types';
import { isIceCreamProduct, normalizeIceCreamProduct } from '../utils/iceCreamUtils';

export const ProductBadge: React.FC<{ product: Product }> = ({ product }) => {
  if (isIceCreamProduct(product)) {
    const conf = normalizeIceCreamProduct(product);
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
  if (product.unit === 'kg') {
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
