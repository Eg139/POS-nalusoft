// src/components/production/useRecipes.ts
import { useState, useMemo } from 'react';
import { Product, RecipeItem } from '../../../types';
import { StorageService } from '../../../services/storageService';

export function useRecipes(
  products: Product[],
  onRefreshData: () => void,
  onUpdateProductRecipe?: (productId: string, recipe: RecipeItem[], hasRecipe: boolean) => void
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Estados de producción
  const [producingProduct, setProducingProduct] = useState<Product | null>(null);
  const [productionQty, setProductionQty] = useState<number>(1);

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'cost' | 'stock'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Filtrar solo productos con receta
  const recipes = useMemo(() => {
    return products.filter((p) => p.has_recipe || (p.recipe && p.recipe.length > 0));
  }, [products]);

  // Categorías dinámicas
  const categories: string[] = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ['Todas', ...Array.from(set)];
  }, [recipes]);

  // Métricas
  const metrics = useMemo(() => {
    const totalCount = recipes.length;
    let totalCost = 0;
    recipes.forEach((r) => {
      totalCost += r.cost_price || 0;
    });
    const avgCost = totalCount > 0 ? totalCost / totalCount : 0;

    return {
      totalCount,
      totalCost: totalCost.toFixed(2),
      avgCost: avgCost.toFixed(2),
    };
  }, [recipes]);

  // Filtrado y ordenamiento de la tabla
  const filteredRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return recipes
      .filter((r) => {
        const matchCategory = categoryFilter === 'Todas' || r.category === categoryFilter;
        const matchQuery =
          !q ||
          r.name.toLowerCase().includes(q) ||
          (r.category && r.category.toLowerCase().includes(q));

        return matchCategory && matchQuery;
      })
      .sort((a, b) => {
        let valA: string | number = a.name;
        let valB: string | number = b.name;

        if (sortField === 'cost') {
          valA = a.cost_price || 0;
          valB = b.cost_price || 0;
        } else if (sortField === 'stock') {
          valA = a.stock || 0;
          valB = b.stock || 0;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [recipes, categoryFilter, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: 'name' | 'cost' | 'stock') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    StorageService.deleteProduct(id);
    setDeletingId(null);
    onRefreshData();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Categoria', 'Costo_Unitario', 'Precio_Venta', 'Stock'];
    const rows = recipes.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.category || ''}"`,
      r.cost_price || 0,
      r.sale_price || 0,
      r.stock || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recetas-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveRecipe = (productId: string, recipe: RecipeItem[], hasRecipe: boolean) => {
    if (onUpdateProductRecipe) {
      onUpdateProductRecipe(productId, recipe, hasRecipe);
    }
    onRefreshData();
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleRegisterProduction = () => {
    if (!producingProduct) return;
    StorageService.registerProduction(producingProduct.id, productionQty);
    setProducingProduct(null);
    setProductionQty(1);
    onRefreshData();
  };

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    categories,
    metrics,
    filteredRecipes,
    sortField,
    sortAsc,
    toggleSort,
    isFormOpen,
    setIsFormOpen,
    editingProduct,
    setEditingProduct,
    viewingProduct,
    setViewingProduct,
    deletingId,
    setDeletingId,
    producingProduct,
    setProducingProduct,
    productionQty,
    setProductionQty,
    handleDeleteRecipe,
    handleExportCSV,
    handleSaveRecipe,
    handleRegisterProduction,
  };
}