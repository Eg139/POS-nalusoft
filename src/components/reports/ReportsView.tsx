import React, { useState, useMemo } from 'react';
import { Sale, Product } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  PiggyBank,
  Percent,
  Download,
  Calendar,
  AlertCircle,
  CreditCard,
  Banknote,
  QrCode,
  ArrowUpRight
} from 'lucide-react';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sales, products }) => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month' | 'all'>('7days');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter((s) => {
      const saleTime = new Date(s.created_at).getTime();
      if (dateRange === 'today') return saleTime >= startOfToday;
      if (dateRange === '7days') return saleTime >= sevenDaysAgo;
      if (dateRange === 'month') return saleTime >= startOfMonth;
      return true;
    });
  }, [sales, dateRange]);

  // Aggregate financial metrics
  const stats = useMemo(() => {
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

    // Item & Category breakdown
    const productStatsMap: Record<
      string,
      { name: string; category: string; qty: number; revenue: number; profit: number; barcode: string }
    > = {};

    const categoryStatsMap: Record<string, { revenue: number; profit: number; itemsSold: number }> = {};

    filteredSales.forEach((s) => {
      totalRevenue += s.total;
      totalCost += s.cost_total;
      totalProfit += s.net_profit;
      totalTax += s.tax;
      totalDiscount += s.discount;

      if (s.payment_method === 'efectivo') {
        cashCount++;
        cashTotal += s.total;
      } else if (s.payment_method === 'tarjeta') {
        cardCount++;
        cardTotal += s.total;
      } else {
        transferCount++;
        transferTotal += s.total;
      }

      s.items.forEach((item) => {
        // Product stats
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

        // Category stats
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

    const topSellingProducts = Object.values(productStatsMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const mostProfitableProducts = Object.values(productStatsMap)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    const categoriesBreakdown = Object.entries(categoryStatsMap).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      profit: data.profit,
      margin: data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : '0',
      share: totalRevenue > 0 ? ((data.revenue / totalRevenue) * 100).toFixed(1) : '0',
      itemsSold: data.itemsSold,
    })).sort((a, b) => b.revenue - a.revenue);

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
      topSellingProducts,
      mostProfitableProducts,
      categoriesBreakdown,
    };
  }, [filteredSales]);

  // Daily Chart Data for the selected period
  const dailyChartData = useMemo(() => {
    const daysMap: Record<string, { dateStr: string; label: string; revenue: number; profit: number }> = {};

    // Sort sales ascending by date
    const sorted = [...filteredSales].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach((s) => {
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = `${d.getDate()} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][d.getMonth()]}`;

      if (!daysMap[key]) {
        daysMap[key] = { dateStr: key, label, revenue: 0, profit: 0 };
      }
      daysMap[key].revenue += s.total;
      daysMap[key].profit += s.net_profit;
    });

    const entries = Object.values(daysMap);
    return entries;
  }, [filteredSales]);

  // Max revenue for chart scaling
  const maxDayRevenue = Math.max(...dailyChartData.map((d) => d.revenue), 100);

  // Export Sales Report CSV
  const handleExportCSV = () => {
    const headers = [
      'Folio',
      'Fecha_Hora',
      'Cajero',
      'Metodo_Pago',
      'Subtotal',
      'Descuento',
      'IVA',
      'Total',
      'Costo_Total',
      'Ganancia_Neta',
      'Margen_Porcentaje',
    ];

    const rows = filteredSales.map((s) => [
      s.folio,
      `"${new Date(s.created_at).toLocaleString('es-MX')}"`,
      `"${s.cashier_name.replace(/"/g, '""')}"`,
      s.payment_method,
      s.subtotal,
      s.discount,
      s.tax,
      s.total,
      s.cost_total,
      s.net_profit,
      s.profit_margin,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte-ventas-superpos-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-50">
      {/* Header & Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reportes de Ventas y Rendimientos</h2>
          <p className="text-xs text-slate-500">
            Análisis de rentabilidad real, márgenes por departamento y volumen comercial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Period Tabs */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateRange === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDateRange('7days')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateRange === '7days' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateRange === 'month' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Este mes
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateRange === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histórico
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Card Hero Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Ingresos Brutos</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            ${stats.totalRevenue.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>{stats.salesCount} tickets emitidos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Costo de Mercancía</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-700 tabular-nums">
            ${stats.totalCost.toFixed(2)}
          </p>
          <div className="text-[11px] text-slate-400 mt-1">
            Costo de adquisición de productos
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Utilidad Neta (Ganancia)</span>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-700 tabular-nums">
            ${stats.totalProfit.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.overallMargin.toFixed(1)}% margen global</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Ticket Promedio</span>
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            ${stats.averageTicket.toFixed(2)}
          </p>
          <div className="text-[11px] text-slate-400 mt-1">
            Gasto promedio por cliente
          </div>
        </div>
      </div>

      {/* Visual Chart: Revenue vs Profit Timeline */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Evolución de Ventas vs Ganancia Neta</h3>
            <p className="text-xs text-slate-500">Comparativa de facturación diaria y margen comercial obtenido</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-900 inline-block"></span>
              <span className="text-slate-600">Ventas ($)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
              <span className="text-slate-600">Ganancia Neta ($)</span>
            </div>
          </div>
        </div>

        {dailyChartData.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No hay registros de ventas en este período para graficar.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {dailyChartData.map((d) => {
              const revPercent = Math.min(100, (d.revenue / maxDayRevenue) * 100);
              const profPercent = Math.min(100, (d.profit / maxDayRevenue) * 100);
              const margin = d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(0) : '0';

              return (
                <div key={d.dateStr} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{d.label}</span>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-slate-900 font-bold">${d.revenue.toFixed(2)}</span>
                      <span className="text-emerald-700 font-bold">Utilidad: ${d.profit.toFixed(2)}</span>
                      <span className="text-slate-400 text-[10px]">({margin}% mg)</span>
                    </div>
                  </div>

                  <div className="w-full h-4 bg-slate-100 rounded-md overflow-hidden flex relative">
                    <div
                      style={{ width: `${revPercent}%` }}
                      className="h-full bg-slate-900 rounded-md transition-all duration-300"
                    />
                    <div
                      style={{ width: `${profPercent}%` }}
                      className="h-full bg-emerald-500 rounded-md absolute left-0 top-0 opacity-90 transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Categories Breakdown & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Categories Performance Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">Rendimiento por Departamento / Categoría</h3>
            <span className="text-xs text-slate-500">{stats.categoriesBreakdown.length} categorías</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Departamento</th>
                  <th className="py-2.5 px-3 text-right">Venta Total</th>
                  <th className="py-2.5 px-3 text-right">Participación</th>
                  <th className="py-2.5 px-3 text-right">Utilidad Neta</th>
                  <th className="py-2.5 px-3 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.categoriesBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Sin datos en el período seleccionado.
                    </td>
                  </tr>
                ) : (
                  stats.categoriesBreakdown.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{cat.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        ${cat.revenue.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                        {cat.share}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                        ${cat.profit.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                        {cat.margin}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Breakdown (1 col) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 mb-1">Medios de Pago Recibidos</h3>
            <p className="text-xs text-slate-500 mb-4">Distribución del flujo de caja</p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800">Efectivo</h5>
                    <span className="text-[10px] text-slate-400">{stats.cashCount} transacciones</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    ${stats.cashTotal.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {stats.totalRevenue > 0
                      ? ((stats.cashTotal / stats.totalRevenue) * 100).toFixed(0) + '%'
                      : '0%'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800">Tarjeta Débito/Crédito</h5>
                    <span className="text-[10px] text-slate-400">{stats.cardCount} transacciones</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    ${stats.cardTotal.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {stats.totalRevenue > 0
                      ? ((stats.cardTotal / stats.totalRevenue) * 100).toFixed(0) + '%'
                      : '0%'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800">Transf. SPEI / QR</h5>
                    <span className="text-[10px] text-slate-400">{stats.transferCount} transacciones</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    ${stats.transferTotal.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {stats.totalRevenue > 0
                      ? ((stats.transferTotal / stats.totalRevenue) * 100).toFixed(0) + '%'
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4 text-[11px] text-slate-400">
            Total facturado en período: <strong className="text-slate-800">${stats.totalRevenue.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Top Sellers vs Top Profit Makers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top 5 Best Sellers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800 mb-1">Top 5 Productos Más Vendidos (Volumen)</h3>
          <p className="text-xs text-slate-500 mb-3">Artículos de mayor rotación en góndola</p>

          <div className="divide-y divide-slate-100">
            {stats.topSellingProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin datos registrados.</p>
            ) : (
              stats.topSellingProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">{p.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                      {p.qty} unids.
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">${p.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top 5 Most Profitable Products */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800 mb-1">Top 5 Productos Más Rentables (Ganancia Neta)</h3>
          <p className="text-xs text-slate-500 mb-3">Mayor contribución en pesos a la utilidad neta</p>

          <div className="divide-y divide-slate-100">
            {stats.mostProfitableProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin datos registrados.</p>
            ) : (
              stats.mostProfitableProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">{p.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 text-xs tabular-nums">
                      +${p.profit.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(0) : '0'}% margen
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">Bitácora Detallada de Tickets Emitidos</h3>
          <span className="text-xs text-slate-500">{filteredSales.length} transacciones en período</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-4">Folio</th>
                <th className="py-2.5 px-3">Fecha / Hora</th>
                <th className="py-2.5 px-3">Cajero</th>
                <th className="py-2.5 px-3">Pago</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-right">IVA</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-right">Ganancia</th>
                <th className="py-2.5 px-3 text-right">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se registran ventas para este filtro.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.folio}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(s.created_at).toLocaleString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{s.cashier_name}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-slate-600">
                      {s.payment_method}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      ${s.subtotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                      ${s.tax.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      ${s.total.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                      +${s.net_profit.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 font-semibold">
                      {s.profit_margin.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
