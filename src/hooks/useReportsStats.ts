import { useMemo } from 'react';
import { Sale } from '../types';

export type ReportDateRange = 'today' | '7days' | 'month' | 'all';

export interface ProductStatItem {
  name: string;
  category: string;
  qty: number;
  revenue: number;
  profit: number;
  barcode: string;
}

export interface CategoryBreakdownItem {
  category: string;
  revenue: number;
  profit: number;
  margin: string;
  share: string;
  itemsSold: number;
}

export interface DailyChartItem {
  dateStr: string;
  label: string;
  revenue: number;
  profit: number;
}

export interface ReportsStats {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalTax: number;
  totalDiscount: number;
  averageTicket: number;
  overallMargin: number;
  salesCount: number;
  cashCount: number;
  cashTotal: number;
  cardCount: number;
  cardTotal: number;
  transferCount: number;
  transferTotal: number;
  topSellingProducts: ProductStatItem[];
  mostProfitableProducts: ProductStatItem[];
  categoriesBreakdown: CategoryBreakdownItem[];
}

export function useReportsStats(sales: Sale[], dateRange: ReportDateRange) {
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const sevenDaysAgo = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter((s) => {
      const saleTime = new Date(s.created_at).getTime();
      if (dateRange === 'today') return saleTime >= startOfToday;
      if (dateRange === '7days') return saleTime >= sevenDaysAgo;
      if (dateRange === 'month') return saleTime >= startOfMonth;
      return true;
    });
  }, [sales, dateRange]);

  const stats: ReportsStats = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let cashCount = 0;
    let cashTotal = 0;
    let cardCount = 0;
    let cardTotal = 0;
    let transferCount = 0;
    let transferTotal = 0;

    const productStatsMap: Record<string, ProductStatItem> = {};
    const categoryStatsMap: Record<string, { revenue: number; profit: number; itemsSold: number }> = {};

    filteredSales.forEach((s) => {
      totalRevenue += s.total;
      totalCost += s.cost_total;
      totalProfit += s.net_profit;
      totalTax += s.tax;
      totalDiscount += s.discount;

      const method = s.payment_method?.toLowerCase().trim() || '';
      if (method.includes('efectivo') || method === 'cash') {
        cashCount++;
        cashTotal += s.total;
      } else if (method.includes('tarjeta') || method.includes('card')) {
        cardCount++;
        cardTotal += s.total;
      } else {
        transferCount++;
        transferTotal += s.total;
      }

      s.items.forEach((item) => {
        if (!productStatsMap[item.product_id]) {
          productStatsMap[item.product_id] = {
            name: item.product_name,
            category: item.category,
            barcode: item.barcode,
            qty: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productStatsMap[item.product_id].qty += item.quantity;
        productStatsMap[item.product_id].revenue += item.total;
        productStatsMap[item.product_id].profit += item.profit;

        if (!categoryStatsMap[item.category]) {
          categoryStatsMap[item.category] = { revenue: 0, profit: 0, itemsSold: 0 };
        }
        categoryStatsMap[item.category].revenue += item.total;
        categoryStatsMap[item.category].profit += item.profit;
        categoryStatsMap[item.category].itemsSold += item.quantity;
      });
    });

    const averageTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const categoriesBreakdown: CategoryBreakdownItem[] = Object.entries(categoryStatsMap)
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        profit: data.profit,
        margin: data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : '0',
        share: totalRevenue > 0 ? ((data.revenue / totalRevenue) * 100).toFixed(1) : '0',
        itemsSold: data.itemsSold,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      totalTax,
      totalDiscount,
      averageTicket,
      overallMargin,
      salesCount: filteredSales.length,
      cashCount,
      cashTotal,
      cardCount,
      cardTotal,
      transferCount,
      transferTotal,
      topSellingProducts: Object.values(productStatsMap).sort((a, b) => b.qty - a.qty).slice(0, 5),
      mostProfitableProducts: Object.values(productStatsMap).sort((a, b) => b.profit - a.profit).slice(0, 5),
      categoriesBreakdown,
    };
  }, [filteredSales]);

  const dailyChartData: DailyChartItem[] = useMemo(() => {
    const daysMap: Record<string, DailyChartItem> = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const sorted = [...filteredSales].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach((s) => {
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = `${d.getDate()} ${months[d.getMonth()]}`;
      if (!daysMap[key]) daysMap[key] = { dateStr: key, label, revenue: 0, profit: 0 };
      daysMap[key].revenue += s.total;
      daysMap[key].profit += s.net_profit;
    });

    return Object.values(daysMap);
  }, [filteredSales]);

  return { filteredSales, stats, dailyChartData };
}
