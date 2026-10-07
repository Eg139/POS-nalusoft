import { Product } from '../../../types';

export const isIceCreamProduct = (product: Product): boolean => {
  if (product.is_icecream_presentation) return true;
  if (product.is_raw_flavor || product.is_supply) return false;

  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  if (
    name.startsWith('paleta') ||
    cat.includes('paleta') ||
    cat.includes('bebida') ||
    cat.includes('topping')
  ) {
    return false;
  }

  return (
    cat.includes('helad') ||
    cat.includes('cono') ||
    cat.includes('vasito') ||
    cat.includes('pote') ||
    name.includes('cono') ||
    name.includes('cucurucho') ||
    name.includes('vasito') ||
    name.includes('pote') ||
    name.includes('sundae')
  );
};

export const normalizeIceCreamProduct = (product: Product): Product => {
  const name = product.name.toLowerCase();
  let maxFlavors = product.max_flavors;
  let totalGrams = product.total_grams;
  let defaultSupplies = product.default_supplies;

  if (name.includes('1 kg') || name.includes('1kg') || name.includes('1000')) {
    maxFlavors = 4;
    totalGrams = 1000;
    defaultSupplies = defaultSupplies || [
      { supply_name: 'Pote Térmico 1 Kg', quantity: 1 },
      { supply_name: 'Cucharitas Plásticas', quantity: 6 },
      { supply_name: 'Servilletas de Papel', quantity: 6 },
    ];
  } else if (name.includes('1/2') || name.includes('500')) {
    maxFlavors = 3;
    totalGrams = 500;
    defaultSupplies = defaultSupplies || [
      { supply_name: 'Pote Térmico 500g', quantity: 1 },
      { supply_name: 'Cucharitas Plásticas', quantity: 4 },
      { supply_name: 'Servilletas de Papel', quantity: 4 },
    ];
  } else if (name.includes('1/4') || name.includes('250')) {
    maxFlavors = 3;
    totalGrams = 250;
    defaultSupplies = defaultSupplies || [
      { supply_name: 'Pote Térmico 250g', quantity: 1 },
      { supply_name: 'Cucharitas Plásticas', quantity: 2 },
      { supply_name: 'Servilletas de Papel', quantity: 2 },
    ];
  } else if (name.includes('mediano') || name.includes('180')) {
    maxFlavors = 3;
    totalGrams = 180;
    defaultSupplies = defaultSupplies || [
      { supply_name: 'Vasito Térmico Mediano', quantity: 1 },
      { supply_name: 'Cucharitas Plásticas', quantity: 1 },
      { supply_name: 'Servilletas de Papel', quantity: 1 },
    ];
  } else if (name.includes('chico') || name.includes('120')) {
    maxFlavors = 2;
    totalGrams = 120;
    defaultSupplies = defaultSupplies || [
      { supply_name: 'Vasito Térmico Chico', quantity: 1 },
      { supply_name: 'Cucharitas Plásticas', quantity: 1 },
      { supply_name: 'Servilletas de Papel', quantity: 1 },
    ];
  } else if (name.includes('doble') || name.includes('waffle') || name.includes('160')) {
    maxFlavors = 2;
    totalGrams = 160;
    defaultSupplies = defaultSupplies || [
      { supply_name: 'Cono Waffle Artesanal', quantity: 1 },
      { supply_name: 'Cucharitas Plásticas', quantity: 1 },
      { supply_name: 'Servilletas de Papel', quantity: 1 },
    ];
  } else if (name.includes('simple') || name.includes('80')) {
    maxFlavors = 1;
    totalGrams = 80;
    defaultSupplies = defaultSupplies || [
      { supply_name: 'Cucurucho Dulce Tradicional', quantity: 1 },
      { supply_name: 'Servilletas de Papel', quantity: 1 },
    ];
  } else {
    maxFlavors = maxFlavors || 2;
    totalGrams = totalGrams || 160;
  }

  return {
    ...product,
    is_icecream_presentation: true,
    max_flavors: maxFlavors,
    total_grams: totalGrams,
    default_supplies: defaultSupplies,
  };
};