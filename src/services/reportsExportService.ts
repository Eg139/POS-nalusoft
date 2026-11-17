import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Sale } from '../types';
import { CategoryBreakdownItem, ReportDateRange } from '../hooks/useReportsStats';

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 24;
  row.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  row.alignment = { horizontal: 'center', vertical: 'middle' };
  row.eachCell((cell, colNumber) => {
    if (colNumber > 1) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
      cell.border = {
        top: { style: 'thin', color: { argb: '0F172A' } },
        bottom: { style: 'medium', color: { argb: '0F172A' } },
        left: { style: 'thin', color: { argb: '334155' } },
        right: { style: 'thin', color: { argb: '334155' } },
      };
    }
  });
}

function addCategoriesSheet(
  workbook: ExcelJS.Workbook,
  categoriesBreakdown: CategoryBreakdownItem[],
  dateRange: ReportDateRange
) {
  const sheet = workbook.addWorksheet('Por Categoría');
  sheet.mergeCells('B2:G2');
  const title = sheet.getCell('B2');
  title.value = 'RENDIMIENTO POR DEPARTAMENTO / CATEGORÍA';
  title.font = { name: 'Arial', size: 14, bold: true, color: { argb: '1E293B' } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('B3:G3');
  const subtitle = sheet.getCell('B3');
  subtitle.value = `Período: ${dateRange.toUpperCase()} — Incluye Participación y Margen completos`;
  subtitle.font = { name: 'Arial', size: 10, italic: true, color: { argb: '64748B' } };
  subtitle.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.addRow([]);
  sheet.columns = [
    { key: 'spacer', width: 4 },
    { header: 'Departamento', key: 'category', width: 26 },
    { header: 'Unidades', key: 'itemsSold', width: 14 },
    { header: 'Venta Total', key: 'revenue', width: 16 },
    { header: 'Participación (%)', key: 'share', width: 18 },
    { header: 'Utilidad Neta', key: 'profit', width: 16 },
    { header: 'Margen (%)', key: 'margin', width: 15 },
  ];

  styleHeaderRow(sheet.getRow(5));

  categoriesBreakdown.forEach((cat, idx) => {
    const row = sheet.addRow({
      spacer: '',
      category: cat.category,
      itemsSold: cat.itemsSold,
      revenue: cat.revenue,
      share: Number((parseFloat(cat.share) / 100).toFixed(4)),
      profit: cat.profit,
      margin: Number((parseFloat(cat.margin) / 100).toFixed(4)),
    });
    const bg = idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF';
    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.font = { name: 'Arial', size: 10, color: { argb: '334155' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        if (colNumber === 4 || colNumber === 6) cell.numFmt = '"$"#,##0.00';
        if (colNumber === 5 || colNumber === 7) cell.numFmt = '0.0%';
      }
    });
  });
}

export async function exportSalesReportExcel(
  filteredSales: Sale[],
  categoriesBreakdown: CategoryBreakdownItem[],
  dateRange: ReportDateRange
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema POS';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Reporte de Ventas');
  worksheet.mergeCells('B2:L2');
  const titleCell = worksheet.getCell('B2');
  titleCell.value = 'REPORTE EJECUTIVO DE VENTAS Y RENTABILIDAD';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: '1E293B' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('B3:L3');
  const subtitleCell = worksheet.getCell('B3');
  subtitleCell.value = `Período: ${dateRange.toUpperCase()} — Generado el ${new Date().toLocaleString('es-MX')}`;
  subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: '64748B' } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]);
  const headerRowNumber = 5;
  worksheet.columns = [
    { key: 'spacer', width: 4 },
    { header: 'Folio', key: 'folio', width: 16 },
    { header: 'Fecha y Hora', key: 'created_at', width: 22 },
    { header: 'Cajero', key: 'cashier_name', width: 20 },
    { header: 'Método Pago', key: 'payment_method', width: 18 },
    { header: 'Subtotal', key: 'subtotal', width: 15 },
    { header: 'Descuento', key: 'discount', width: 15 },
    { header: 'IVA', key: 'tax', width: 15 },
    { header: 'Total', key: 'total', width: 15 },
    { header: 'Costo Total', key: 'cost_total', width: 15 },
    { header: 'Ganancia Neta', key: 'net_profit', width: 16 },
    { header: 'Margen (%)', key: 'profit_margin', width: 15 },
  ];

  styleHeaderRow(worksheet.getRow(headerRowNumber));

  filteredSales.forEach((s, index) => {
    const row = worksheet.addRow({
      spacer: '',
      folio: s.folio,
      created_at: new Date(s.created_at).toLocaleString('es-MX'),
      cashier_name: s.cashier_name || 'N/D',
      payment_method: s.payment_method || 'Efectivo',
      subtotal: s.subtotal,
      discount: s.discount,
      tax: s.tax,
      total: s.total,
      cost_total: s.cost_total,
      net_profit: s.net_profit,
      profit_margin: Number((s.profit_margin / 100).toFixed(4)),
    });
    row.height = 20;
    const rowBgColor = index % 2 === 0 ? 'F8FAFC' : 'FFFFFF';

    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.font = { name: 'Arial', size: 10, color: { argb: '334155' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } },
        };
        if (colNumber >= 6 && colNumber <= 11) {
          cell.numFmt = '"$"#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (colNumber === 12) {
          cell.numFmt = '0.0%';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      }
    });
  });

  if (filteredSales.length > 0) {
    const totalRowNumber = headerRowNumber + filteredSales.length + 1;
    const totalsRow = worksheet.getRow(totalRowNumber);
    totalsRow.height = 22;
    totalsRow.getCell(2).value = 'TOTALES';
    ['F', 'G', 'H', 'I', 'J', 'K'].forEach((col, i) => {
      totalsRow.getCell(6 + i).value = { formula: `SUM(${col}${headerRowNumber + 1}:${col}${totalRowNumber - 1})` };
    });
    totalsRow.getCell(12).value = { formula: `IF(I${totalRowNumber}>0,K${totalRowNumber}/I${totalRowNumber},0)` };
    totalsRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '0F172A' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
        if (colNumber >= 6 && colNumber <= 11) cell.numFmt = '"$"#,##0.00';
        if (colNumber === 12) cell.numFmt = '0.0%';
      }
    });
  }

  addCategoriesSheet(workbook, categoriesBreakdown, dateRange);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `reporte-financiero-ventas-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
