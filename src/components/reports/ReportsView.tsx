import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Sale, Product } from '../../types';
import { useReportsStats, ReportDateRange } from '../../hooks/useReportsStats';
import { exportSalesReportExcel } from '../../services/reportsExportService';
import { ReportsMetricsGrid } from './ReportsMetricsGrid';
import { ReportsChart } from './ReportsChart';
import { ReportsCategoriesAndPayments } from './ReportsCategoriesAndPayments';
import { ReportsTopProducts } from './ReportsTopProducts';
import { ReportsSalesTable } from './ReportsSalesTable';
import { ReportsTicketModal } from './ReportsTicketModal';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sales }) => {
  const [dateRange, setDateRange] = useState<ReportDateRange>('7days');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  const { filteredSales, stats, dailyChartData } = useReportsStats(sales, dateRange);

  const handleExport = () => {
    exportSalesReportExcel(filteredSales, stats.categoriesBreakdown, dateRange);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-50 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Reportes de Ventas y Rendimientos</h2>
          <p className="text-xs text-slate-500">
            Análisis de rentabilidad, departamentos y volumen comercial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs overflow-x-auto max-w-full">
            {(['today', '7days', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  dateRange === range ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'today' && 'Hoy'}
                {range === '7days' && '7 días'}
                {range === 'month' && 'Este mes'}
                {range === 'all' && 'Histórico'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      <ReportsMetricsGrid stats={stats} />
      <ReportsChart dailyChartData={dailyChartData} />
      <ReportsCategoriesAndPayments stats={stats} />
      <ReportsTopProducts stats={stats} />
      <ReportsSalesTable sales={filteredSales} onSelectSale={setSelectedSaleDetail} />
      <ReportsTicketModal sale={selectedSaleDetail} onClose={() => setSelectedSaleDetail(null)} />
    </div>
  );
};